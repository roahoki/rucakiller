import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { gameId, locations, weapons } = await request.json();

    // Validar datos
    if (!gameId) {
      return NextResponse.json(
        { error: 'El ID del juego es requerido' },
        { status: 400 }
      );
    }

    if (!locations || !Array.isArray(locations) || locations.length < 5) {
      return NextResponse.json(
        { error: 'Debes proporcionar al menos 5 lugares' },
        { status: 400 }
      );
    }

    if (!weapons || !Array.isArray(weapons) || weapons.length < 18) {
      return NextResponse.json(
        { error: 'Debes proporcionar 18 armas' },
        { status: 400 }
      );
    }

    // Verificar que el juego existe
    const { data: game, error: gameError } = await supabase
      .from('games')
      .select('id, status')
      .eq('id', gameId)
      .single();

    if (gameError || !game) {
      return NextResponse.json(
        { error: 'Juego no encontrado' },
        { status: 404 }
      );
    }

    // Verificar que el juego esté en estado lobby
    if (game.status !== 'lobby') {
      return NextResponse.json(
        { error: 'Solo se puede configurar en estado lobby' },
        { status: 400 }
      );
    }

    // Eliminar configuración anterior (por si re-configura)
    await supabase.from('locations').delete().eq('game_id', gameId);
    await supabase.from('weapons').delete().eq('game_id', gameId);

    // Insertar lugares
    const locationsData = locations.map((name: string) => ({
      game_id: gameId,
      name: name.trim(),
    }));

    const { error: locationsError } = await supabase
      .from('locations')
      .insert(locationsData);

    if (locationsError) {
      console.error('Error inserting locations:', locationsError);
      return NextResponse.json(
        { error: 'Error al guardar los lugares' },
        { status: 500 }
      );
    }

    // Insertar armas
    const weaponsData = weapons.map((name: string) => ({
      game_id: gameId,
      name: name.trim(),
      is_available: true,
    }));

    const { error: weaponsError } = await supabase
      .from('weapons')
      .insert(weaponsData);

    if (weaponsError) {
      console.error('Error inserting weapons:', weaponsError);
      return NextResponse.json(
        { error: 'Error al guardar las armas' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Configuración guardada correctamente',
      locations: locations.length,
      weapons: weapons.length,
    });

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Error inesperado al guardar la configuración' },
      { status: 500 }
    );
  }
}
