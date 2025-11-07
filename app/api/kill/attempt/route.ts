import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const { hunterId, targetId, gameId } = await request.json();

    // Validar que todos los campos estén presentes
    if (!hunterId || !targetId || !gameId) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      );
    }

    // Verificar que el juego existe y está activo
    const { data: game, error: gameError } = await supabase
      .from('games')
      .select('status')
      .eq('id', gameId)
      .single();

    if (gameError || !game) {
      return NextResponse.json(
        { error: 'Partida no encontrada' },
        { status: 404 }
      );
    }

    if (game.status !== 'active') {
      return NextResponse.json(
        { error: 'El juego no está activo. No se pueden realizar asesinatos.' },
        { status: 400 }
      );
    }

    // Verificar que el hunter está vivo
    const { data: hunter, error: hunterError } = await supabase
      .from('players')
      .select('is_alive, name')
      .eq('id', hunterId)
      .single();

    if (hunterError || !hunter) {
      return NextResponse.json(
        { error: 'Jugador no encontrado' },
        { status: 404 }
      );
    }

    if (!hunter.is_alive) {
      return NextResponse.json(
        { error: 'No puedes asesinar si estás muerto' },
        { status: 400 }
      );
    }

    // Verificar que el target está vivo
    const { data: target, error: targetError } = await supabase
      .from('players')
      .select('is_alive, name')
      .eq('id', targetId)
      .single();

    if (targetError || !target) {
      return NextResponse.json(
        { error: 'Objetivo no encontrado' },
        { status: 404 }
      );
    }

    if (!target.is_alive) {
      return NextResponse.json(
        { error: 'Tu objetivo ya está muerto' },
        { status: 400 }
      );
    }

    // Verificar que el hunter tiene este target asignado
    const { data: assignment, error: assignmentError } = await supabase
      .from('assignments')
      .select('location, weapon')
      .eq('game_id', gameId)
      .eq('hunter_id', hunterId)
      .eq('target_id', targetId)
      .eq('is_active', true)
      .single();

    if (assignmentError || !assignment) {
      return NextResponse.json(
        { error: 'Este no es tu objetivo asignado' },
        { status: 400 }
      );
    }

    // Verificar si ya hay un intento pendiente
    const { data: existingEvent } = await supabase
      .from('events')
      .select('id')
      .eq('game_id', gameId)
      .eq('killer_id', hunterId)
      .eq('victim_id', targetId)
      .eq('confirmed', false)
      .single();

    if (existingEvent) {
      return NextResponse.json(
        { error: 'Ya tienes un intento de asesinato pendiente' },
        { status: 400 }
      );
    }

    // Crear el evento de asesinato (sin confirmar)
    const { data: event, error: eventError } = await supabase
      .from('events')
      .insert({
        game_id: gameId,
        event_type: 'kill',
        killer_id: hunterId,
        victim_id: targetId,
        location: assignment.location,
        weapon: assignment.weapon,
        confirmed: false,
      })
      .select()
      .single();

    if (eventError) {
      console.error('Error creating kill event:', eventError);
      return NextResponse.json(
        { error: 'Error al crear el evento de asesinato' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Intento de asesinato registrado. Esperando confirmación de la víctima.',
      eventId: event.id,
    });
  } catch (error) {
    console.error('Error in kill attempt:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
