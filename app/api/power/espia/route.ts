import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * API para usar el poder del Espía
 * El Espía puede ver el NOMBRE del objetivo de otro jugador (sin condiciones)
 * Uso único por partida
 */
export async function POST(request: NextRequest) {
  try {
    const { playerId, targetPlayerId, gameId } = await request.json();

    // Validar datos requeridos
    if (!playerId || !targetPlayerId || !gameId) {
      return NextResponse.json(
        { error: 'Faltan datos requeridos' },
        { status: 400 }
      );
    }

    // Verificar que el jugador es un Espía
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

    if (player.special_character !== 'espia') {
      return NextResponse.json(
        { error: 'Solo los Espías pueden usar este poder' },
        { status: 403 }
      );
    }

    if (player.special_character_used) {
      return NextResponse.json(
        { error: 'Ya usaste tu poder de Espía' },
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
      .select('target_id')
      .eq('game_id', gameId)
      .eq('hunter_id', targetPlayerId)
      .eq('is_active', true)
      .single();

    if (assignmentError || !assignment) {
      return NextResponse.json(
        { error: 'El jugador seleccionado no tiene objetivo asignado' },
        { status: 404 }
      );
    }

    // Obtener el NOMBRE del objetivo (sin condiciones)
    const { data: target, error: targetError } = await supabase
      .from('players')
      .select('name')
      .eq('id', assignment.target_id)
      .single();

    if (targetError || !target) {
      return NextResponse.json(
        { error: 'Objetivo no encontrado' },
        { status: 404 }
      );
    }

    // Marcar el poder como usado
    await supabase
      .from('players')
      .update({ special_character_used: true })
      .eq('id', playerId);

    // Registrar evento en la tabla events
    await supabase.from('events').insert({
      game_id: gameId,
      event_type: 'special_used',
      killer_id: playerId,
      victim_id: targetPlayerId,
      location: null,
      weapon: null,
      confirmed: true,
    });

    return NextResponse.json({
      success: true,
      targetName: target.name,
      message: `El objetivo de ese jugador es: ${target.name}`,
    });

  } catch (error) {
    console.error('Error in espia power:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
