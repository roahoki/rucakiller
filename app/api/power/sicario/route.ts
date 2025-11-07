import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const { playerId, newTargetId, gameId } = await request.json();

    // Validar campos requeridos
    if (!playerId || !newTargetId || !gameId) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      );
    }

    // Verificar que el juego existe y está activo
    const { data: game, error: gameError } = await supabase
      .from('games')
      .select('status')
      .eq('id', gameId)
      .single();

    if (gameError || !game) {
      return NextResponse.json(
        { error: 'Partida no encontrada' },
        { status: 404 }
      );
    }

    if (game.status !== 'active') {
      return NextResponse.json(
        { error: 'El juego no está activo' },
        { status: 400 }
      );
    }

    // Verificar que el jugador tiene el poder sicario y no lo ha usado
    const { data: player, error: playerError } = await supabase
      .from('players')
      .select('power_2kills, power_2kills_used, is_alive, name')
      .eq('id', playerId)
      .single();

    if (playerError || !player) {
      return NextResponse.json(
        { error: 'Jugador no encontrado' },
        { status: 404 }
      );
    }

    if (!player.is_alive) {
      return NextResponse.json(
        { error: 'No puedes usar poderes si estás muerto' },
        { status: 400 }
      );
    }

    if (player.power_2kills !== 'sicario') {
      return NextResponse.json(
        { error: 'No tienes el poder de Sicario' },
        { status: 400 }
      );
    }

    if (player.power_2kills_used) {
      return NextResponse.json(
        { error: 'Ya has usado tu poder de Sicario' },
        { status: 400 }
      );
    }

    // Verificar que el nuevo objetivo existe y está vivo
    const { data: newTarget, error: targetError } = await supabase
      .from('players')
      .select('id, name, is_alive')
      .eq('id', newTargetId)
      .eq('game_id', gameId)
      .single();

    if (targetError || !newTarget) {
      return NextResponse.json(
        { error: 'Jugador objetivo no encontrado' },
        { status: 404 }
      );
    }

    if (!newTarget.is_alive) {
      return NextResponse.json(
        { error: 'No puedes elegir como objetivo a un jugador muerto' },
        { status: 400 }
      );
    }

    if (newTargetId === playerId) {
      return NextResponse.json(
        { error: 'No puedes elegirte a ti mismo como objetivo' },
        { status: 400 }
      );
    }

    // Verificar que el jugador tiene una asignación activa
    const { data: currentAssignment, error: currentAssignmentError } = await supabase
      .from('assignments')
      .select('*')
      .eq('hunter_id', playerId)
      .eq('is_active', true)
      .single();

    if (currentAssignmentError || !currentAssignment) {
      return NextResponse.json(
        { error: 'No tienes una asignación activa' },
        { status: 404 }
      );
    }

    // Verificar que el nuevo objetivo no es el mismo que el actual
    if (currentAssignment.target_id === newTargetId) {
      return NextResponse.json(
        { error: 'Ese ya es tu objetivo actual' },
        { status: 400 }
      );
    }

    // Desactivar la asignación actual
    const { error: deactivateError } = await supabase
      .from('assignments')
      .update({ is_active: false })
      .eq('id', currentAssignment.id);

    if (deactivateError) {
      console.error('Error deactivating assignment:', deactivateError);
      return NextResponse.json(
        { error: 'Error al desactivar la asignación actual' },
        { status: 500 }
      );
    }

    // Obtener un lugar aleatorio
    const { data: locations } = await supabase
      .from('locations')
      .select('name')
      .eq('game_id', gameId);

    const randomLocation = locations && locations.length > 0
      ? locations[Math.floor(Math.random() * locations.length)].name
      : 'Lugar desconocido';

    // Obtener un arma disponible
    const { data: weapons } = await supabase
      .from('weapons')
      .select('*')
      .eq('game_id', gameId)
      .eq('is_available', true)
      .limit(1);

    let newWeapon = 'Arma desconocida';
    
    if (weapons && weapons.length > 0) {
      newWeapon = weapons[0].name;
      
      // Marcar la nueva arma como no disponible
      await supabase
        .from('weapons')
        .update({ is_available: false })
        .eq('id', weapons[0].id);
    }

    // Marcar el arma anterior como disponible
    if (currentAssignment.weapon) {
      await supabase
        .from('weapons')
        .update({ is_available: true })
        .eq('game_id', gameId)
        .eq('name', currentAssignment.weapon);
    }

    // Crear nueva asignación
    const { data: newAssignment, error: newAssignmentError } = await supabase
      .from('assignments')
      .insert({
        game_id: gameId,
        hunter_id: playerId,
        target_id: newTargetId,
        location: randomLocation,
        weapon: newWeapon,
        is_active: true,
      })
      .select()
      .single();

    if (newAssignmentError) {
      console.error('Error creating new assignment:', newAssignmentError);
      // Intentar rollback
      await supabase
        .from('assignments')
        .update({ is_active: true })
        .eq('id', currentAssignment.id);
      
      return NextResponse.json(
        { error: 'Error al crear la nueva asignación' },
        { status: 500 }
      );
    }

    // Marcar el poder como usado
    const { error: updateError } = await supabase
      .from('players')
      .update({ power_2kills_used: true })
      .eq('id', playerId);

    if (updateError) {
      console.error('Error updating player power status:', updateError);
    }

    // Crear evento
    await supabase.from('events').insert({
      game_id: gameId,
      event_type: 'power_used',
      killer_id: playerId,
      victim_id: newTargetId,
      confirmed: true,
    });

    // Notificar al sicario
    await supabase.from('notifications').insert({
      game_id: gameId,
      player_id: playerId,
      type: 'private',
      message: `🎯 Nuevo objetivo elegido: ${newTarget.name}`,
      read: false,
    });

    // Enviar pista del arma al nuevo objetivo
    await supabase.from('notifications').insert({
      game_id: gameId,
      player_id: newTargetId,
      type: 'private',
      message: `💀 Alguien te está cazando con: ${newWeapon}`,
      read: false,
    });

    // Notificación pública
    await supabase.from('notifications').insert({
      game_id: gameId,
      player_id: null,
      type: 'public',
      message: '🎯 Un jugador ha usado el poder de Sicario',
      read: false,
    });

    return NextResponse.json({
      success: true,
      newAssignment: {
        targetName: newTarget.name,
        location: randomLocation,
        weapon: newWeapon,
      },
    });
  } catch (error) {
    console.error('Error in sicario power:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
