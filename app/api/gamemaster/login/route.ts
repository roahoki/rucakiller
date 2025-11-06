import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { verifyPin } from '@/lib/pin-utils';

export async function POST(request: NextRequest) {
  try {
    const { gameCode, pin } = await request.json();

    // Validar datos
    if (!gameCode || gameCode.trim() === '') {
      return NextResponse.json(
        { error: 'El código de partida es requerido' },
        { status: 400 }
      );
    }

    if (!pin || pin.trim() === '') {
      return NextResponse.json(
        { error: 'El PIN es requerido' },
        { status: 400 }
      );
    }

    // Buscar la partida por código
    const { data: game, error: gameError } = await supabase
      .from('games')
      .select('id, code, status, game_master_id, game_master_pin')
      .eq('code', gameCode.trim().toUpperCase())
      .single();

    if (gameError || !game) {
      return NextResponse.json(
        { error: 'Código de partida inválido o no existe' },
        { status: 404 }
      );
    }

    // Verificar que tenga un PIN configurado
    if (!game.game_master_pin) {
      return NextResponse.json(
        { error: 'Esta partida no tiene GameMaster configurado' },
        { status: 400 }
      );
    }

    // Verificar el PIN
    const isPinValid = await verifyPin(pin, game.game_master_pin);

    if (!isPinValid) {
      return NextResponse.json(
        { error: 'PIN incorrecto' },
        { status: 401 }
      );
    }

    // Obtener información del GameMaster
    const { data: gameMaster, error: masterError } = await supabase
      .from('players')
      .select('id, name, is_game_master')
      .eq('id', game.game_master_id)
      .single();

    if (masterError || !gameMaster) {
      return NextResponse.json(
        { error: 'GameMaster no encontrado' },
        { status: 404 }
      );
    }

    // Retornar información de la sesión
    return NextResponse.json({
      success: true,
      game: {
        id: game.id,
        code: game.code,
        status: game.status,
      },
      gameMaster: {
        id: gameMaster.id,
        name: gameMaster.name,
      },
    });

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Error inesperado al iniciar sesión' },
      { status: 500 }
    );
  }
}
