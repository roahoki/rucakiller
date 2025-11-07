import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * API para usar el poder del Saboteador
 * El Saboteador puede ver las condiciones de otro jugador y cambiar UNA (lugar O arma)
 * El objetivo NO es notificado del cambio
 * Uso único por partida
 */
export async function POST(request: NextRequest) {
  try {
    const { playerId, targetPlayerId, gameId, changeType, newValue } = await request.json();

    // Validar datos requeridos
    if (!playerId || !targetPlayerId || !gameId || !changeType || !newValue) {
      return NextResponse.json(
        { error: 'Faltan datos requeridos' },
        { status: 400 }
      );
    }

    if (changeType !== 'location' && changeType !== 'weapon') {
      return NextResponse.json(
        { error: 'changeType debe ser "location" o "weapon"' },
        { status: 400 }
      );
    }

    // Verificar que el jugador es un Saboteador
    const { data: player, error: playerError } = await supabase
      .from('players')
      .select('*')
      .eq('id', playerId)
      .single();

    if (playerError || !player) {
      return NextResponse.json(
        { error: 'Jugador no encontrado' },
        { status: 404 }
      );
    }

    if (player.special_character !== 'saboteador') {
      return NextResponse.json(
        { error: 'Solo los Saboteadores pueden usar este poder' },
        { status: 403 }
      );
    }

    if (player.special_character_used) {
      return NextResponse.json(
        { error: 'Ya usaste tu poder de Saboteador' },
        { status: 400 }
      );
    }

    if (!player.is_alive) {
      return NextResponse.json(
        { error: 'No puedes usar poderes si estás muerto' },
        { status: 400 }
      );
    }

    // Verificar que el juego está activo
    const { data: game } = await supabase
      .from('games')
      .select('status')
      .eq('id', gameId)
      .single();

    if (game?.status !== 'active') {
      return NextResponse.json(
        { error: 'El juego no está activo' },
        { status: 400 }
      );
    }

    // Obtener la asignación del jugador objetivo
    const { data: assignment, error: assignmentError } = await supabase
      .from('assignments')
      .select('*')
      .eq('game_id', gameId)
      .eq('hunter_id', targetPlayerId)
      .eq('is_active', true)
      .single();

    if (assignmentError || !assignment) {
      return NextResponse.json(
        { error: 'El jugador seleccionado no tiene asignación activa' },
        { status: 404 }
      );
    }

    // Si está cambiando el arma, validar que esté disponible
    if (changeType === 'weapon') {
      // Liberar el arma actual
      await supabase
        .from('weapons')
        .update({ is_available: true })
        .eq('game_id', gameId)
        .eq('name', assignment.weapon);

      // Marcar la nueva arma como no disponible
      const { data: weaponCheck } = await supabase
        .from('weapons')
        .select('*')
        .eq('game_id', gameId)
        .eq('name', newValue)
        .single();

      if (!weaponCheck) {
        return NextResponse.json(
          { error: 'Arma no válida' },
          { status: 400 }
        );
      }

      await supabase
        .from('weapons')
        .update({ is_available: false })
        .eq('game_id', gameId)
        .eq('name', newValue);
    }

    // Si está cambiando el lugar, validar que exista
    if (changeType === 'location') {
      const { data: locationCheck } = await supabase
        .from('locations')
        .select('*')
        .eq('game_id', gameId)
        .eq('name', newValue)
        .single();

      if (!locationCheck) {
        return NextResponse.json(
          { error: 'Lugar no válido' },
          { status: 400 }
        );
      }
    }

    // Actualizar la asignación
    const updateData = changeType === 'location' 
      ? { location: newValue }
      : { weapon: newValue };

    await supabase
      .from('assignments')
      .update(updateData)
      .eq('id', assignment.id);

    // Marcar el poder como usado
    await supabase
      .from('players')
      .update({ special_character_used: true })
      .eq('id', playerId);

    // Registrar evento
    await supabase.from('events').insert({
      game_id: gameId,
      event_type: 'special_used',
      killer_id: playerId,
      victim_id: targetPlayerId,
      location: changeType === 'location' ? newValue : assignment.location,
      weapon: changeType === 'weapon' ? newValue : assignment.weapon,
      confirmed: true,
    });

    const oldValue = changeType === 'location' ? assignment.location : assignment.weapon;

    return NextResponse.json({
      success: true,
      message: `Has cambiado ${changeType === 'location' ? 'el lugar' : 'el arma'} de "${oldValue}" a "${newValue}"`,
      oldValue,
      newValue,
      changeType,
    });

  } catch (error) {
    console.error('Error in saboteador power:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
