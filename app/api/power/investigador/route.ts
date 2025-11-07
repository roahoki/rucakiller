import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const { playerId, targetPlayerId, gameId } = await request.json();

    // Validar campos requeridos
    if (!playerId || !targetPlayerId || !gameId) {
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

    // Verificar que el jugador tiene el poder investigador y no lo ha usado
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

    if (player.power_2kills !== 'investigador') {
      return NextResponse.json(
        { error: 'No tienes el poder de Investigador' },
        { status: 400 }
      );
    }

    if (player.power_2kills_used) {
      return NextResponse.json(
        { error: 'Ya has usado tu poder de Investigador' },
        { status: 400 }
      );
    }

    // Verificar que el jugador objetivo existe y está vivo
    const { data: targetPlayer, error: targetError } = await supabase
      .from('players')
      .select('id, name, is_alive')
      .eq('id', targetPlayerId)
      .eq('game_id', gameId)
      .single();

    if (targetError || !targetPlayer) {
      return NextResponse.json(
        { error: 'Jugador objetivo no encontrado' },
        { status: 404 }
      );
    }

    if (!targetPlayer.is_alive) {
      return NextResponse.json(
        { error: 'No puedes investigar a un jugador muerto' },
        { status: 400 }
      );
    }

    if (targetPlayerId === playerId) {
      return NextResponse.json(
        { error: 'No puedes investigarte a ti mismo' },
        { status: 400 }
      );
    }

    // Obtener la asignación activa del jugador objetivo
    const { data: assignment, error: assignmentError } = await supabase
      .from('assignments')
      .select('target_id, location, weapon')
      .eq('hunter_id', targetPlayerId)
      .eq('is_active', true)
      .single();

    if (assignmentError || !assignment) {
      return NextResponse.json(
        { error: 'El jugador objetivo no tiene asignación activa' },
        { status: 404 }
      );
    }

    // Obtener el nombre de la víctima del jugador investigado
    const { data: victim, error: victimError } = await supabase
      .from('players')
      .select('name')
      .eq('id', assignment.target_id)
      .single();

    if (victimError || !victim) {
      return NextResponse.json(
        { error: 'No se pudo obtener información de la víctima' },
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
      return NextResponse.json(
        { error: 'Error al actualizar el estado del poder' },
        { status: 500 }
      );
    }

    // Crear evento de investigación
    await supabase.from('events').insert({
      game_id: gameId,
      event_type: 'power_used',
      killer_id: playerId,
      victim_id: targetPlayerId,
      confirmed: true,
    });

    // Notificar al investigador
    await supabase.from('notifications').insert({
      game_id: gameId,
      player_id: playerId,
      type: 'private',
      message: `🔍 Investigación completa: ${targetPlayer.name} debe asesinar a ${victim.name} en ${assignment.location} con ${assignment.weapon}`,
      read: false,
    });

    // Notificar al jugador investigado
    await supabase.from('notifications').insert({
      game_id: gameId,
      player_id: targetPlayerId,
      type: 'private',
      message: `⚠️ ${player.name} ha investigado tu objetivo`,
      read: false,
    });

    // Notificación pública
    await supabase.from('notifications').insert({
      game_id: gameId,
      player_id: null,
      type: 'public',
      message: '🔍 Un jugador ha usado el poder de Investigador',
      read: false,
    });

    return NextResponse.json({
      success: true,
      investigation: {
        targetName: targetPlayer.name,
        victimName: victim.name,
        location: assignment.location,
        weapon: assignment.weapon,
      },
    });
  } catch (error) {
    console.error('Error in investigador power:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
