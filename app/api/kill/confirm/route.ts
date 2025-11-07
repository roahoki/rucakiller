import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const { eventId, victimId, confirmed } = await request.json();

    // Validar campos requeridos
    if (!eventId || !victimId || confirmed === undefined) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      );
    }

    // Obtener el evento
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('*, games!inner(status)')
      .eq('id', eventId)
      .eq('victim_id', victimId)
      .eq('confirmed', false)
      .single();

    if (eventError || !event) {
      return NextResponse.json(
        { error: 'Evento no encontrado o ya confirmado' },
        { status: 404 }
      );
    }

    // Verificar que el juego está activo
    if (event.games.status !== 'active') {
      return NextResponse.json(
        { error: 'El juego no está activo' },
        { status: 400 }
      );
    }

    if (!confirmed) {
      // RECHAZAR EL ASESINATO - CASTIGO: EL ASESINO MUERE
      
      // 1. Eliminar el evento
      const { error: deleteError } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId);

      if (deleteError) {
        console.error('Error deleting event:', deleteError);
        return NextResponse.json(
          { error: 'Error al cancelar el asesinato' },
          { status: 500 }
        );
      }

      // 2. MATAR AL ASESINO (como castigo por intentar sin cumplir condiciones)
      const { error: killHunterError } = await supabase
        .from('players')
        .update({ is_alive: false })
        .eq('id', event.killer_id);

      if (killHunterError) {
        console.error('Error killing hunter:', killHunterError);
        return NextResponse.json(
          { error: 'Error al aplicar castigo' },
          { status: 500 }
        );
      }

      // 3. Desactivar la asignación del asesino (ya está muerto)
      await supabase
        .from('assignments')
        .update({ is_active: false })
        .eq('hunter_id', event.killer_id)
        .eq('is_active', true);

      // 4. Obtener nombre del asesino para notificaciones
      const { data: killerData } = await supabase
        .from('players')
        .select('name')
        .eq('id', event.killer_id)
        .single();

      const killerName = killerData?.name || 'Un jugador';

      // 5. Notificar al asesino que murió por intentar sin condiciones correctas
      await supabase.from('notifications').insert({
        game_id: event.game_id,
        player_id: event.killer_id,
        type: 'private',
        message: '💀 Tu intento de asesinato fue rechazado. Has sido eliminado por intentar asesinar sin cumplir las condiciones.',
        read: false,
      });

      // 6. Notificación pública
      await supabase.from('notifications').insert({
        game_id: event.game_id,
        player_id: null,
        type: 'public',
        message: `⚖️ ${killerName} fue eliminado por intentar un asesinato sin cumplir las condiciones`,
        read: false,
      });

      // 7. Verificar cuántos jugadores quedan vivos
      const { data: alivePlayersCheck } = await supabase
        .from('players')
        .select('id, name')
        .eq('game_id', event.game_id)
        .eq('is_alive', true)
        .eq('is_game_master', false);

      const aliveCount = alivePlayersCheck?.length || 0;

      // 8. Si solo queda 1 jugador, hay un ganador
      if (aliveCount === 1) {
        // Desactivar todas las asignaciones
        await supabase
          .from('assignments')
          .update({ is_active: false })
          .eq('game_id', event.game_id)
          .eq('is_active', true);

        // Marcar el juego como terminado
        await supabase
          .from('games')
          .update({
            status: 'finished',
            end_time: new Date().toISOString(),
          })
          .eq('id', event.game_id);

        return NextResponse.json({
          success: true,
          message: 'Asesinato rechazado. El asesino ha sido eliminado. ¡Hay un ganador!',
          winner: true,
          killerDied: true,
        });
      }

      // 9. Notificar cuántos quedan
      await supabase.from('notifications').insert({
        game_id: event.game_id,
        player_id: null,
        type: 'public',
        message: `Quedan ${aliveCount} jugadores vivos`,
        read: false,
      });

      return NextResponse.json({
        success: true,
        message: 'Asesinato rechazado. El asesino ha sido eliminado.',
        killerDied: true,
      });
    }

    // CONFIRMAR EL ASESINATO

    // Verificar si la víctima tiene cazador con poder asesino_serial (CONTRA)
    const { data: victimHunter } = await supabase
      .from('assignments')
      .select('hunter_id')
      .eq('target_id', victimId)
      .eq('is_active', true)
      .single();

    let hunterHasAsesinoSerial = false;
    if (victimHunter) {
      const { data: hunterPower } = await supabase
        .from('players')
        .select('power_2kills')
        .eq('id', victimHunter.hunter_id)
        .single();
      
      hunterHasAsesinoSerial = hunterPower?.power_2kills === 'asesino_serial';
    }
    
    // 1. Marcar el evento como confirmado
    const { error: confirmError } = await supabase
      .from('events')
      .update({ confirmed: true })
      .eq('id', eventId);

    if (confirmError) {
      console.error('Error confirming event:', confirmError);
      return NextResponse.json(
        { error: 'Error al confirmar el asesinato' },
        { status: 500 }
      );
    }

    // 2. Marcar a la víctima como muerta
    const { error: victimError } = await supabase
      .from('players')
      .update({ is_alive: false })
      .eq('id', victimId);

    if (victimError) {
      console.error('Error updating victim:', victimError);
      return NextResponse.json(
        { error: 'Error al actualizar la víctima' },
        { status: 500 }
      );
    }

    // 3. Incrementar kill_count del asesino
    const { error: killerError } = await supabase.rpc('increment_kill_count', {
      player_id: event.killer_id,
    });

    if (killerError) {
      console.error('Error incrementing kill count:', killerError);
      // No es crítico, continuar
    }

    // 4. Verificar cuántos jugadores quedan vivos ANTES de la herencia
    const { data: alivePlayersCheck, error: aliveCheckError } = await supabase
      .from('players')
      .select('id')
      .eq('game_id', event.game_id)
      .eq('is_alive', true)
      .eq('is_game_master', false);

    const aliveCount = alivePlayersCheck?.length || 0;

    // 5. HERENCIA DEL OBJETIVO (solo si quedan más de 1 jugador vivo)
    if (aliveCount > 1) {
      // Obtener la asignación de la víctima (su objetivo)
      const { data: victimAssignment, error: victimAssignmentError } = await supabase
        .from('assignments')
        .select('*')
        .eq('hunter_id', victimId)
        .eq('is_active', true)
        .single();

      if (victimAssignmentError) {
        console.error('Error fetching victim assignment:', victimAssignmentError);
      }

      // Desactivar la asignación actual del asesino
      const { error: deactivateError } = await supabase
        .from('assignments')
        .update({ is_active: false })
        .eq('hunter_id', event.killer_id)
        .eq('is_active', true);

      if (deactivateError) {
        console.error('Error deactivating hunter assignment:', deactivateError);
      }

      // Desactivar la asignación de la víctima
      const { error: deactivateVictimError } = await supabase
        .from('assignments')
        .update({ is_active: false })
        .eq('hunter_id', victimId)
        .eq('is_active', true);

      if (deactivateVictimError) {
        console.error('Error deactivating victim assignment:', deactivateVictimError);
      }

      // Si la víctima tenía un objetivo, heredarlo
      if (victimAssignment) {
      // El asesino hereda el objetivo de la víctima con nuevas condiciones
      // Obtener un lugar aleatorio
      const { data: locations } = await supabase
        .from('locations')
        .select('name')
        .eq('game_id', event.game_id);

      const randomLocation = locations && locations.length > 0
        ? locations[Math.floor(Math.random() * locations.length)].name
        : victimAssignment.location;

      // Obtener un arma disponible
      const { data: weapons } = await supabase
        .from('weapons')
        .select('*')
        .eq('game_id', event.game_id)
        .eq('is_available', true)
        .limit(1);

      const newWeapon = weapons && weapons.length > 0
        ? weapons[0].name
        : victimAssignment.weapon;

      // Marcar el arma del asesino anterior como disponible
      await supabase
        .from('weapons')
        .update({ is_available: true })
        .eq('game_id', event.game_id)
        .eq('name', event.weapon);

      // Marcar la nueva arma como no disponible
      if (weapons && weapons.length > 0) {
        await supabase
          .from('weapons')
          .update({ is_available: false })
          .eq('id', weapons[0].id);
      }

      // Crear nueva asignación para el asesino
      const { data: newAssignment, error: newAssignmentError } = await supabase
        .from('assignments')
        .insert({
          game_id: event.game_id,
          hunter_id: event.killer_id,
          target_id: victimAssignment.target_id,
          location: randomLocation,
          weapon: newWeapon,
          is_active: true,
        })
        .select()
        .single();

      if (newAssignmentError) {
        console.error('Error creating new assignment:', newAssignmentError);
      }

      // Notificar al asesino de su nuevo objetivo
      const { data: newTarget } = await supabase
        .from('players')
        .select('name')
        .eq('id', victimAssignment.target_id)
        .single();

      if (newTarget) {
        await supabase.from('notifications').insert({
          game_id: event.game_id,
          player_id: event.killer_id,
          type: 'private',
          message: `¡Asesinato confirmado! Tu nuevo objetivo es: ${newTarget.name}`,
          read: false,
        });
      }
    }
    } else {
      // Es el último jugador - GANADOR!
      // Desactivar todas las asignaciones
      await supabase
        .from('assignments')
        .update({ is_active: false })
        .eq('game_id', event.game_id)
        .eq('is_active', true);

      // Marcar el juego como terminado
      await supabase
        .from('games')
        .update({
          status: 'finished',
          end_time: new Date().toISOString(),
        })
        .eq('id', event.game_id);

      return NextResponse.json({
        success: true,
        message: 'Asesinato confirmado. ¡Hay un ganador!',
        winner: true,
      });
    }

    // 6. Crear notificación pública (solo si no hay ganador)
    await supabase.from('notifications').insert({
      game_id: event.game_id,
      player_id: null,
      type: 'public',
      message: '⚔️ Se ha producido un asesinato',
      read: false,
    });

    // 7. Notificar cuántos quedan vivos
    await supabase.from('notifications').insert({
      game_id: event.game_id,
      player_id: null,
      type: 'public',
      message: `Quedan ${aliveCount} jugadores vivos`,
      read: false,
    });

    return NextResponse.json({
      success: true,
      message: 'Asesinato confirmado exitosamente',
    });
  } catch (error) {
    console.error('Error in kill confirm:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
