import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { gameId, assignmentId, newTargetId, newLocation, newWeapon } = await request.json();

    // Validar que se proporcionaron todos los datos necesarios
    if (!gameId || !assignmentId) {
      return NextResponse.json(
        { error: 'Faltan datos requeridos' },
        { status: 400 }
      );
    }

    // Obtener la asignación actual
    const { data: assignment, error: assignmentError } = await supabase
      .from('assignments')
      .select('*')
      .eq('id', assignmentId)
      .eq('game_id', gameId)
      .single();

    if (assignmentError || !assignment) {
      return NextResponse.json(
        { error: 'Asignación no encontrada' },
        { status: 404 }
      );
    }

    // Si se está cambiando el objetivo, validar
    if (newTargetId && newTargetId !== assignment.target_id) {
      // Verificar que el nuevo objetivo existe y está vivo
      const { data: newTarget, error: targetError } = await supabase
        .from('players')
        .select('*')
        .eq('id', newTargetId)
        .eq('game_id', gameId)
        .single();

      if (targetError || !newTarget) {
        return NextResponse.json(
          { error: 'El jugador objetivo no existe' },
          { status: 404 }
        );
      }

      if (!newTarget.is_alive) {
        return NextResponse.json(
          { error: 'El jugador objetivo está muerto' },
          { status: 400 }
        );
      }

      // Verificar que no sea el mismo hunter
      if (newTargetId === assignment.hunter_id) {
        return NextResponse.json(
          { error: 'Un jugador no puede ser su propio objetivo' },
          { status: 400 }
        );
      }

      // Verificar que no se cree un ciclo directo (A→B y B→A)
      const { data: reverseAssignment } = await supabase
        .from('assignments')
        .select('*')
        .eq('game_id', gameId)
        .eq('hunter_id', newTargetId)
        .eq('target_id', assignment.hunter_id)
        .eq('is_active', true)
        .maybeSingle();

      if (reverseAssignment) {
        return NextResponse.json(
          { error: 'Esta reasignación crearía un ciclo directo (A→B y B→A)' },
          { status: 400 }
        );
      }
    }

    // Construir el objeto de actualización
    const updateData: any = {};
    if (newTargetId) updateData.target_id = newTargetId;
    if (newLocation) updateData.location = newLocation;
    if (newWeapon) updateData.weapon = newWeapon;

    // Si no hay nada que actualizar
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No se especificaron cambios' },
        { status: 400 }
      );
    }

    // Actualizar la asignación
    const { data: updatedAssignment, error: updateError } = await supabase
      .from('assignments')
      .update(updateData)
      .eq('id', assignmentId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating assignment:', updateError);
      return NextResponse.json(
        { error: 'Error al actualizar la asignación' },
        { status: 500 }
      );
    }

    // Obtener información del hunter y nuevo objetivo para la notificación
    const { data: hunter } = await supabase
      .from('players')
      .select('name')
      .eq('id', assignment.hunter_id)
      .single();

    const { data: newTarget } = newTargetId ? await supabase
      .from('players')
      .select('name')
      .eq('id', newTargetId)
      .single() : { data: null };

    // Crear notificación privada para el hunter
    const changes = [];
    if (newTargetId) changes.push(`nuevo objetivo: ${newTarget?.name}`);
    if (newLocation) changes.push(`nuevo lugar: ${newLocation}`);
    if (newWeapon) changes.push(`nueva arma: ${newWeapon}`);

    await supabase
      .from('notifications')
      .insert({
        game_id: gameId,
        player_id: assignment.hunter_id,
        type: 'private',
        message: `🔄 GameMaster ha reasignado tu misión: ${changes.join(', ')}`,
        read: false,
      });

    // Notificación pública para todos
    await supabase
      .from('notifications')
      .insert({
        game_id: gameId,
        player_id: null,
        type: 'public',
        message: `🔄 GameMaster ha realizado una reasignación manual`,
        read: false,
      });

    return NextResponse.json({
      success: true,
      assignment: updatedAssignment,
    });

  } catch (error) {
    console.error('Error in reassign endpoint:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
