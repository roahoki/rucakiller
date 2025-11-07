import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function DELETE(request: NextRequest) {
  try {
    const { gameId, weaponId } = await request.json();

    // Validar datos requeridos
    if (!gameId || !weaponId) {
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
        { error: 'Solo se pueden eliminar armas en el lobby' },
        { status: 400 }
      );
    }

    // Contar jugadores activos (no GameMaster)
    const { count: playerCount, error: playersError } = await supabase
      .from('players')
      .select('*', { count: 'exact', head: true })
      .eq('game_id', gameId)
      .eq('is_game_master', false);

    if (playersError) {
      console.error('Error counting players:', playersError);
      return NextResponse.json(
        { error: 'Error al contar jugadores' },
        { status: 500 }
      );
    }

    // Contar armas actuales
    const { count: weaponCount, error: weaponsError } = await supabase
      .from('weapons')
      .select('*', { count: 'exact', head: true })
      .eq('game_id', gameId);

    if (weaponsError) {
      console.error('Error counting weapons:', weaponsError);
      return NextResponse.json(
        { error: 'Error al contar armas' },
        { status: 500 }
      );
    }

    // Validar que después de eliminar queden suficientes armas
    const remainingWeapons = (weaponCount || 0) - 1;
    if (remainingWeapons < (playerCount || 0)) {
      return NextResponse.json(
        { error: `No puedes eliminar esta arma. Necesitas al menos ${playerCount} armas para ${playerCount} jugadores` },
        { status: 400 }
      );
    }

    // Eliminar el arma
    const { error: deleteError } = await supabase
      .from('weapons')
      .delete()
      .eq('id', weaponId)
      .eq('game_id', gameId);

    if (deleteError) {
      console.error('Error deleting weapon:', deleteError);
      return NextResponse.json(
        { error: 'Error al eliminar el arma' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Arma eliminada correctamente',
    });

  } catch (error) {
    console.error('Error in remove weapon endpoint:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
