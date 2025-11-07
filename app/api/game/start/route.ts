import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { generateCircularAssignments, validateCircularChain } from '@/lib/assignment-algorithm';
import { assignSpecialCharacters } from '@/lib/game-utils';

export async function POST(request: NextRequest) {
  try {
    const { gameId } = await request.json();

    // Validar que se proporcione el gameId
    if (!gameId) {
      return NextResponse.json(
        { error: 'El ID del juego es requerido' },
        { status: 400 }
      );
    }

    // Verificar que el juego existe y está en estado lobby
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

    if (game.status !== 'lobby') {
      return NextResponse.json(
        { error: 'El juego ya fue iniciado o finalizó' },
        { status: 400 }
      );
    }

    // Obtener jugadores (excluyendo GameMaster para asignaciones)
    const { data: players, error: playersError } = await supabase
      .from('players')
      .select('*')
      .eq('game_id', gameId)
      .eq('is_alive', true);

    if (playersError || !players) {
      return NextResponse.json(
        { error: 'Error al obtener jugadores' },
        { status: 500 }
      );
    }

    const killers = players.filter(p => !p.is_game_master);

    if (killers.length < 2) {
      return NextResponse.json(
        { error: 'Se necesitan al menos 2 jugadores (sin contar GameMaster)' },
        { status: 400 }
      );
    }

    // Obtener lugares configurados
    const { data: locations, error: locationsError } = await supabase
      .from('locations')
      .select('*')
      .eq('game_id', gameId);

    if (locationsError || !locations || locations.length < 1) {
      return NextResponse.json(
        { error: 'No hay lugares configurados' },
        { status: 400 }
      );
    }

    // Obtener armas configuradas
    const { data: weapons, error: weaponsError } = await supabase
      .from('weapons')
      .select('*')
      .eq('game_id', gameId);

    if (weaponsError || !weapons || weapons.length < killers.length) {
      return NextResponse.json(
        { error: 'No hay suficientes armas configuradas' },
        { status: 400 }
      );
    }

    // Generar asignaciones circulares
    const assignments = generateCircularAssignments(killers, locations, weapons);

    // Validar que la cadena sea correcta
    if (!validateCircularChain(assignments)) {
      return NextResponse.json(
        { error: 'Error al generar cadena circular válida' },
        { status: 500 }
      );
    }

    // Limpiar asignaciones anteriores (por si se reinicia)
    await supabase.from('assignments').delete().eq('game_id', gameId);

    // Insertar asignaciones en la base de datos
    const assignmentsData = assignments.map(a => ({
      game_id: gameId,
      hunter_id: a.hunter_id,
      target_id: a.target_id,
      location: a.location,
      weapon: a.weapon,
      is_active: true,
    }));

    const { error: insertError } = await supabase
      .from('assignments')
      .insert(assignmentsData);

    if (insertError) {
      console.error('Error inserting assignments:', insertError);
      return NextResponse.json(
        { error: 'Error al guardar las asignaciones' },
        { status: 500 }
      );
    }

    // Marcar armas como usadas
    const usedWeaponNames = assignments.map(a => a.weapon);
    await supabase
      .from('weapons')
      .update({ is_available: false })
      .eq('game_id', gameId)
      .in('name', usedWeaponNames);

    // Asignar personajes especiales a ~30% de los jugadores
    const killerIds = killers.map(k => k.id);
    const specialCharacterAssignments = assignSpecialCharacters(killerIds);

    // Actualizar jugadores con personajes especiales
    for (const assignment of specialCharacterAssignments) {
      await supabase
        .from('players')
        .update({ special_character: assignment.character })
        .eq('id', assignment.playerId);
    }

    console.log(`Personajes especiales asignados: ${specialCharacterAssignments.length}/${killers.length} jugadores`);

    // Crear los 2 poderes disponibles para esta partida (uno de cada tipo)
    const powerTypes = ['asesino_serial', 'investigador'];
    const powersData = powerTypes.map(powerName => ({
      game_id: gameId,
      power_name: powerName,
      is_taken: false,
      taken_by_player_id: null,
    }));

    const { error: powersError } = await supabase
      .from('available_powers')
      .insert(powersData);

    if (powersError) {
      console.error('Error creating available powers:', powersError);
      // No retornamos error, solo logueamos (no es crítico)
    } else {
      console.log(`Poderes creados: ${powerTypes.length} poderes disponibles`);
    }

    // Cambiar estado del juego a "active"
    const { error: updateError } = await supabase
      .from('games')
      .update({ 
        status: 'active',
        start_time: new Date().toISOString(),
      })
      .eq('id', gameId);

    if (updateError) {
      console.error('Error updating game status:', updateError);
      return NextResponse.json(
        { error: 'Error al cambiar el estado del juego' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Juego iniciado correctamente',
      assignments: assignments.length,
      players: killers.length,
    });

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Error inesperado al iniciar el juego' },
      { status: 500 }
    );
  }
}
