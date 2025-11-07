import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * API para usar el poder del Detective
 * El Detective recibe una pista: lugar + arma de una asignación aleatoria
 * NO se le dice quién está involucrado
 * Uso único por partida
 */
export async function POST(request: NextRequest) {
  try {
    const { playerId, gameId } = await request.json();

    // Validar datos requeridos
    if (!playerId || !gameId) {
      return NextResponse.json(
        { error: 'Faltan datos requeridos' },
        { status: 400 }
      );
    }

    // Verificar que el jugador es un Detective
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

    if (player.special_character !== 'detective') {
      return NextResponse.json(
        { error: 'Solo los Detectives pueden usar este poder' },
        { status: 403 }
      );
    }

    if (player.special_character_used) {
      return NextResponse.json(
        { error: 'Ya usaste tu poder de Detective' },
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

    // Obtener todas las asignaciones activas (excepto la del detective)
    const { data: assignments, error: assignmentsError } = await supabase
      .from('assignments')
      .select('location, weapon')
      .eq('game_id', gameId)
      .eq('is_active', true)
      .neq('hunter_id', playerId); // Excluir la propia

    if (assignmentsError || !assignments || assignments.length === 0) {
      return NextResponse.json(
        { error: 'No hay asignaciones disponibles para investigar' },
        { status: 404 }
      );
    }

    // Seleccionar una asignación aleatoria
    const randomIndex = Math.floor(Math.random() * assignments.length);
    const randomAssignment = assignments[randomIndex];

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
      victim_id: null,
      location: randomAssignment.location,
      weapon: randomAssignment.weapon,
      confirmed: true,
    });

    return NextResponse.json({
      success: true,
      clue: {
        location: randomAssignment.location,
        weapon: randomAssignment.weapon,
      },
      message: `Pista: Alguien debe asesinar en ${randomAssignment.location} con ${randomAssignment.weapon}`,
    });

  } catch (error) {
    console.error('Error in detective power:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
