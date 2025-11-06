import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { generateGameCode } from '@/lib/game-utils';
import { hashPin, isValidPin } from '@/lib/pin-utils';

export async function POST(request: NextRequest) {
  try {
    const { gameMasterName, pin } = await request.json();

    // Validar que se proporcione el nombre del GameMaster
    if (!gameMasterName || gameMasterName.trim() === '') {
      return NextResponse.json(
        { error: 'El nombre del GameMaster es requerido' },
        { status: 400 }
      );
    }

    // Validar PIN
    if (!pin || !isValidPin(pin)) {
      return NextResponse.json(
        { error: 'El PIN debe tener entre 4 y 6 dígitos' },
        { status: 400 }
      );
    }

    // Hashear el PIN
    const hashedPin = await hashPin(pin);

    // Generar código único (intentar hasta 5 veces si hay colisión)
    let gameCode = '';
    let attempts = 0;
    const maxAttempts = 5;

    while (attempts < maxAttempts) {
      gameCode = generateGameCode();
      
      // Verificar que el código no exista
      const { data: existingGame } = await supabase
        .from('games')
        .select('code')
        .eq('code', gameCode)
        .single();

      if (!existingGame) {
        break; // Código único encontrado
      }
      
      attempts++;
    }

    if (attempts === maxAttempts) {
      return NextResponse.json(
        { error: 'No se pudo generar un código único. Intenta nuevamente.' },
        { status: 500 }
      );
    }

    // Estrategia: Crear todo usando una función SQL para mantener atomicidad
    // Llamar a función SQL que crea el juego y el GameMaster en una transacción
    const { data, error } = await supabase.rpc('create_game_with_master', {
      p_code: gameCode,
      p_master_name: gameMasterName.trim(),
      p_pin: hashedPin,
    });

    if (error) {
      console.error('Error creating game:', error);
      return NextResponse.json(
        { error: 'Error al crear la partida' },
        { status: 500 }
      );
    }

    // Retornar la información de la partida creada
    return NextResponse.json({
      success: true,
      game: {
        id: data.game_id,
        code: gameCode,
      },
      gameMaster: {
        id: data.master_id,
        name: gameMasterName.trim(),
      },
    });

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Error inesperado al crear la partida' },
      { status: 500 }
    );
  }
}
