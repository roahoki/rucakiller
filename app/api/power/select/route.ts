import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * API para seleccionar un poder de 2 kills
 * El jugador que llega a 2 kills puede elegir uno de los 3 poderes disponibles
 * Cada poder es único (solo un jugador puede tenerlo)
 */
export async function POST(request: NextRequest) {
  try {
    const { playerId, gameId, powerName } = await request.json();

    // Validar datos requeridos
    if (!playerId || !gameId || !powerName) {
      return NextResponse.json(
        { error: 'Faltan datos requeridos' },
        { status: 400 }
      );
    }

    // Validar que el powerName sea válido
    const validPowers = ['asesino_serial', 'investigador', 'sicario'];
    if (!validPowers.includes(powerName)) {
      return NextResponse.json(
        { error: 'Tipo de poder inválido' },
        { status: 400 }
      );
    }

    // Verificar que el jugador existe y tiene 2 o más kills
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

    if (player.kill_count < 2) {
      return NextResponse.json(
        { error: 'Necesitas al menos 2 kills para elegir un poder' },
        { status: 400 }
      );
    }

    if (player.power_2kills) {
      return NextResponse.json(
        { error: 'Ya tienes un poder de 2 kills' },
        { status: 400 }
      );
    }

    if (!player.is_alive) {
      return NextResponse.json(
        { error: 'No puedes elegir un poder si estás muerto' },
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

    // Verificar que el poder está disponible (no ha sido tomado)
    const { data: power, error: powerError } = await supabase
      .from('available_powers')
      .select('*')
      .eq('game_id', gameId)
      .eq('power_name', powerName)
      .eq('is_taken', false)
      .single();

    if (powerError || !power) {
      return NextResponse.json(
        { error: 'Este poder ya fue tomado por otro jugador' },
        { status: 400 }
      );
    }

    // Marcar el poder como tomado (transacción atómica con UPDATE)
    const { error: updatePowerError } = await supabase
      .from('available_powers')
      .update({
        is_taken: true,
        taken_by_player_id: playerId,
      })
      .eq('id', power.id)
      .eq('is_taken', false); // Asegurar que no fue tomado mientras se procesaba

    if (updatePowerError) {
      console.error('Error updating power:', updatePowerError);
      return NextResponse.json(
        { error: 'Error al tomar el poder (puede que otro jugador lo tomó primero)' },
        { status: 500 }
      );
    }

    // Asignar el poder al jugador
    const { error: updatePlayerError } = await supabase
      .from('players')
      .update({ power_2kills: powerName })
      .eq('id', playerId);

    if (updatePlayerError) {
      console.error('Error updating player:', updatePlayerError);
      // Revertir el cambio en available_powers
      await supabase
        .from('available_powers')
        .update({
          is_taken: false,
          taken_by_player_id: null,
        })
        .eq('id', power.id);

      return NextResponse.json(
        { error: 'Error al asignar el poder al jugador' },
        { status: 500 }
      );
    }

    // Registrar evento
    await supabase.from('events').insert({
      game_id: gameId,
      event_type: 'power_used',
      killer_id: playerId,
      victim_id: null,
      location: null,
      weapon: null,
      confirmed: true,
    });

    // Crear notificación pública
    const powerDisplayNames: Record<string, string> = {
      asesino_serial: 'Asesino Serial',
      investigador: 'Investigador',
      sicario: 'Sicario',
    };

    await supabase.from('notifications').insert({
      game_id: gameId,
      player_id: null, // Notificación pública
      type: 'public',
      message: `⚡ ${player.name} ha obtenido el poder de ${powerDisplayNames[powerName]}`,
      read: false,
    });

    return NextResponse.json({
      success: true,
      power: powerName,
      message: `Has obtenido el poder de ${powerDisplayNames[powerName]}`,
    });

  } catch (error) {
    console.error('Error in power selection:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
