import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { gameId, weaponName } = await request.json();

    // Validar datos requeridos
    if (!gameId || !weaponName || !weaponName.trim()) {
      return NextResponse.json(
        { error: 'Faltan datos requeridos' },
        { status: 400 }
      );
    }

    // Verificar que el juego existe y está en lobby
    const { data: game, error: gameError } = await supabase
      .from('games')
      .select('status')
      .eq('id', gameId)
      .single();

    if (gameError || !game) {
      return NextResponse.json(
        { error: 'Juego no encontrado' },
        { status: 404 }
      );
    }

    if (game.status !== 'lobby') {
      return NextResponse.json(
        { error: 'Solo se pueden agregar armas en el lobby' },
        { status: 400 }
      );
    }

    // Verificar que no exista un arma con el mismo nombre
    const { data: existingWeapon } = await supabase
      .from('weapons')
      .select('id')
      .eq('game_id', gameId)
      .ilike('name', weaponName.trim())
      .maybeSingle();

    if (existingWeapon) {
      return NextResponse.json(
        { error: 'Ya existe un arma con ese nombre' },
        { status: 400 }
      );
    }

    // Crear el arma
    const { data: newWeapon, error: insertError } = await supabase
      .from('weapons')
      .insert({
        game_id: gameId,
        name: weaponName.trim(),
        is_available: true,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error creating weapon:', insertError);
      return NextResponse.json(
        { error: 'Error al crear el arma' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      weapon: newWeapon,
    });

  } catch (error) {
    console.error('Error in add weapon endpoint:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
