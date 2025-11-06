import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { playerName, gameCode } = await request.json();

    // Validar datos
    if (!playerName || playerName.trim() === '') {
      return NextResponse.json(
        { error: 'El nombre del jugador es requerido' },
        { status: 400 }
      );
    }

    if (!gameCode || gameCode.trim() === '') {
      return NextResponse.json(
        { error: 'El código de partida es requerido' },
        { status: 400 }
      );
    }

    // Buscar la partida por código
    const { data: game, error: gameError } = await supabase
      .from('games')
      .select('id, code, status')
      .eq('code', gameCode.trim().toUpperCase())
      .single();

    if (gameError || !game) {
      return NextResponse.json(
        { error: 'Código de partida inválido o no existe' },
        { status: 404 }
      );
    }

    // Verificar que la partida esté en estado 'lobby'
    if (game.status !== 'lobby') {
      return NextResponse.json(
        { error: 'La partida ya comenzó o finalizó' },
        { status: 400 }
      );
    }

    // Verificar que el jugador no esté ya en la partida
    const { data: existingPlayer } = await supabase
      .from('players')
      .select('id')
      .eq('game_id', game.id)
      .eq('name', playerName.trim())
      .single();

    if (existingPlayer) {
      return NextResponse.json(
        { error: 'Ya existe un jugador con ese nombre en esta partida' },
        { status: 400 }
      );
    }

    // Crear el jugador
    const { data: player, error: playerError } = await supabase
      .from('players')
      .insert({
        game_id: game.id,
        name: playerName.trim(),
        is_game_master: false,
        is_alive: true,
      })
      .select()
      .single();

    if (playerError || !player) {
      console.error('Error creating player:', playerError);
      return NextResponse.json(
        { error: 'Error al crear el jugador' },
        { status: 500 }
      );
    }

    // Retornar información del jugador y juego
    return NextResponse.json({
      success: true,
      player: {
        id: player.id,
        name: player.name,
      },
      game: {
        id: game.id,
        code: game.code,
      },
    });

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Error inesperado al unirse a la partida' },
      { status: 500 }
    );
  }
}
