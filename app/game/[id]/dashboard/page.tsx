'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import type { Game, Player, Assignment, Event } from '@/lib/types';
import ReassignmentModal from '@/components/ReassignmentModal';

interface AssignmentWithPlayers extends Assignment {
  hunter_name?: string;
  target_name?: string;
}

export default function GameMasterDashboard() {
  const params = useParams();
  const router = useRouter();
  const gameId = params.id as string;
  const [game, setGame] = useState<Game | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [assignments, setAssignments] = useState<AssignmentWithPlayers[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [pausing, setPausing] = useState(false);
  const [ending, setEnding] = useState(false);
  const [showReassignModal, setShowReassignModal] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<AssignmentWithPlayers | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      // Verificar autenticación de GameMaster
      const isGameMaster = localStorage.getItem('isGameMaster') === 'true';
      if (!isGameMaster) {
        router.push(`/game/${gameId}`);
        return;
      }

      // Obtener juego
      const { data: gameData, error: gameError } = await supabase
        .from('games')
        .select('*')
        .eq('id', gameId)
        .single();

      if (gameError) {
        console.error('Error fetching game:', gameError);
        setLoading(false);
        return;
      }

      setGame(gameData);

      // Obtener jugadores
      const { data: playersData, error: playersError } = await supabase
        .from('players')
        .select('*')
        .eq('game_id', gameId)
        .order('created_at', { ascending: true });

      if (playersError) {
        console.error('Error fetching players:', playersError);
      } else {
        setPlayers(playersData || []);
      }

      // Obtener asignaciones activas con nombres de jugadores
      const { data: assignmentsData, error: assignmentsError } = await supabase
        .from('assignments')
        .select('*')
        .eq('game_id', gameId)
        .eq('is_active', true);

      if (!assignmentsError && assignmentsData) {
        // Enriquecer asignaciones con nombres
        const enrichedAssignments = await Promise.all(
          assignmentsData.map(async (assignment) => {
            const { data: hunter } = await supabase
              .from('players')
              .select('name')
              .eq('id', assignment.hunter_id)
              .single();

            const { data: target } = await supabase
              .from('players')
              .select('name')
              .eq('id', assignment.target_id)
              .single();

            return {
              ...assignment,
              hunter_name: hunter?.name,
              target_name: target?.name,
            };
          })
        );
        setAssignments(enrichedAssignments);
      }

      // Obtener eventos confirmados
      const { data: eventsData, error: eventsError } = await supabase
        .from('events')
        .select('*')
        .eq('game_id', gameId)
        .eq('confirmed', true)
        .order('created_at', { ascending: false })
        .limit(10);

      if (!eventsError) {
        setEvents(eventsData || []);
      }

      setLoading(false);
    };

    fetchData();

    // Suscripciones en tiempo real
    const playersChannel = supabase
      .channel(`dashboard_players:${gameId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'players',
          filter: `game_id=eq.${gameId}`,
        },
        () => {
          // Refetch players
          supabase
            .from('players')
            .select('*')
            .eq('game_id', gameId)
            .order('created_at', { ascending: true })
            .then(({ data }) => {
              if (data) setPlayers(data);
            });
        }
      )
      .subscribe();

    const gameChannel = supabase
      .channel(`dashboard_game:${gameId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'games',
          filter: `id=eq.${gameId}`,
        },
        (payload) => {
          setGame(payload.new as Game);
        }
      )
      .subscribe();

    const eventsChannel = supabase
      .channel(`dashboard_events:${gameId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'events',
          filter: `game_id=eq.${gameId}`,
        },
        () => {
          // Refetch events
          supabase
            .from('events')
            .select('*')
            .eq('game_id', gameId)
            .eq('confirmed', true)
            .order('created_at', { ascending: false })
            .limit(10)
            .then(({ data }) => {
              if (data) setEvents(data);
            });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(playersChannel);
      supabase.removeChannel(gameChannel);
      supabase.removeChannel(eventsChannel);
    };
  }, [gameId, router]);

  const handlePauseResume = async () => {
    if (!game) return;

    setPausing(true);

    const newStatus = game.status === 'active' ? 'paused' : 'active';

    const { error } = await supabase
      .from('games')
      .update({ status: newStatus })
      .eq('id', gameId);

    if (error) {
      console.error('Error updating game status:', error);
      alert('Error al actualizar el estado del juego');
    } else {
      // Crear notificación pública
      await supabase.from('notifications').insert({
        game_id: gameId,
        player_id: null,
        type: 'public',
        message: newStatus === 'paused' ? '⏸️ El juego ha sido pausado' : '▶️ El juego ha sido reanudado',
        read: false,
      });
    }

    setPausing(false);
  };

  const handleEndGame = async () => {
    if (!game) return;

    const confirmEnd = window.confirm(
      '¿Estás seguro de que quieres terminar la partida? Esta acción no se puede deshacer.'
    );

    if (!confirmEnd) return;

    setEnding(true);

    const { error } = await supabase
      .from('games')
      .update({ 
        status: 'finished',
        end_time: new Date().toISOString()
      })
      .eq('id', gameId);

    if (error) {
      console.error('Error ending game:', error);
      alert('Error al terminar la partida');
      setEnding(false);
    } else {
      // Desactivar todas las asignaciones
      await supabase
        .from('assignments')
        .update({ is_active: false })
        .eq('game_id', gameId);

      // Crear notificación pública
      await supabase.from('notifications').insert({
        game_id: gameId,
        player_id: null,
        type: 'public',
        message: '🏁 El GameMaster ha terminado la partida',
        read: false,
      });

      alert('Partida finalizada exitosamente');
      setEnding(false);
    }
  };

  const handleRemovePlayer = async (playerId: string, playerName: string) => {
    const confirmRemove = window.confirm(
      `¿Estás seguro de que quieres eliminar a ${playerName}? Esta acción no se puede deshacer.`
    );

    if (!confirmRemove) return;

    try {
      // Eliminar jugador
      const { error } = await supabase
        .from('players')
        .delete()
        .eq('id', playerId);

      if (error) {
        console.error('Error removing player:', error);
        alert('Error al eliminar el jugador');
      } else {
        // Notificar
        await supabase.from('notifications').insert({
          game_id: gameId,
          player_id: null,
          type: 'public',
          message: `👋 ${playerName} ha sido eliminado de la partida`,
          read: false,
        });

        alert(`${playerName} ha sido eliminado exitosamente`);
      }
    } catch (error) {
      console.error('Error removing player:', error);
      alert('Error al eliminar el jugador');
    }
  };

  const handleBackToMenu = () => {
    // Limpiar autenticación de GameMaster
    localStorage.removeItem('isGameMaster');
    // Redirigir a la página principal
    router.push('/');
  };

  if (loading) {
    return (
      <div className="h-screen w-full overflow-hidden bg-gradient-to-br from-red-900 via-red-950 to-black p-4">
        <div className="flex h-full items-center justify-center">
          <p className="text-white">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="h-screen w-full overflow-hidden bg-gradient-to-br from-red-900 via-red-950 to-black p-4">
        <div className="flex h-full items-center justify-center">
          <p className="text-red-200">Partida no encontrada</p>
        </div>
      </div>
    );
  }

  const alivePlayers = players.filter(p => p.is_alive && !p.is_game_master);
  const deadPlayers = players.filter(p => !p.is_alive);
  const totalKills = players.reduce((sum, p) => sum + p.kill_count, 0);

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-purple-900 via-purple-950 to-black p-4">
      <div className="mx-auto max-w-6xl pb-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="mb-4 text-4xl font-bold text-white">
            👑 Dashboard GameMaster
          </h1>
          <div className="inline-block rounded-lg bg-black/50 px-6 py-3 backdrop-blur-sm">
            <p className="text-sm text-purple-200">Código de partida</p>
            <p className="text-2xl font-bold tracking-wider text-white">{game.code}</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="mb-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="rounded-xl bg-black/30 p-5 backdrop-blur-sm border border-green-500/30">
            <p className="text-sm text-gray-400">Jugadores vivos</p>
            <p className="text-3xl font-bold text-green-400">{alivePlayers.length}</p>
          </div>
          <div className="rounded-xl bg-black/30 p-5 backdrop-blur-sm border border-red-500/30">
            <p className="text-sm text-gray-400">Eliminados</p>
            <p className="text-3xl font-bold text-red-400">{deadPlayers.length}</p>
          </div>
          <div className="rounded-xl bg-black/30 p-5 backdrop-blur-sm border border-yellow-500/30">
            <p className="text-sm text-gray-400">Total asesinatos</p>
            <p className="text-3xl font-bold text-yellow-400">{totalKills}</p>
          </div>
          <div className="rounded-xl bg-black/30 p-5 backdrop-blur-sm border border-blue-500/30">
            <p className="text-sm text-gray-400">Estado</p>
            <p className={`text-xl font-bold capitalize ${
              game.status === 'active' ? 'text-green-400' : 
              game.status === 'paused' ? 'text-yellow-400' : 
              'text-gray-400'
            }`}>
              {game.status}
            </p>
          </div>
        </div>

        {/* Control Button */}
        {(game.status === 'active' || game.status === 'paused') && (
          <div className="mb-6">
            <button
              onClick={handlePauseResume}
              disabled={pausing}
              className={`w-full rounded-xl p-4 font-bold text-white shadow-lg transition-all hover:shadow-xl active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${
                game.status === 'active'
                  ? 'bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800'
                  : 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800'
              }`}
            >
              {pausing ? 'Procesando...' : game.status === 'active' ? '⏸️ Pausar Juego' : '▶️ Reanudar Juego'}
            </button>
          </div>
        )}

        {/* End Game and Back to Menu Buttons */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {(game.status === 'active' || game.status === 'paused') && (
            <button
              onClick={handleEndGame}
              disabled={ending}
              className="rounded-xl p-4 font-bold text-white shadow-lg transition-all bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 hover:shadow-xl active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {ending ? 'Finalizando...' : '🏁 Terminar Partida'}
            </button>
          )}
          <button
            onClick={handleBackToMenu}
            className="rounded-xl p-4 font-bold text-white shadow-lg transition-all bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 hover:shadow-xl active:scale-95"
          >
            🏠 Volver al Menú Principal
          </button>
        </div>

        {/* Players List */}
        <div className="mb-6 rounded-xl bg-black/30 p-6 backdrop-blur-sm">
          <h2 className="mb-4 text-2xl font-bold text-white">Jugadores</h2>
          <div className="space-y-2">
            {players.filter(p => !p.is_game_master).map((player) => (
              <div
                key={player.id}
                className={`flex items-center justify-between rounded-lg p-4 backdrop-blur-sm ${
                  player.is_alive
                    ? 'bg-green-900/20 border border-green-500/30'
                    : 'bg-gray-900/20 border border-gray-500/30'
                }`}
              >
                <div className="flex items-center gap-3 flex-1">
                  <span className="text-2xl">
                    {player.is_alive ? '✅' : '☠️'}
                  </span>
                  <div className="flex-1">
                    <p className={`font-semibold ${player.is_alive ? 'text-white' : 'text-gray-400'}`}>
                      {player.name}
                    </p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {player.special_character && (
                        <span className="text-xs text-purple-300">
                          🎭 {player.special_character}
                          {player.special_character_used && ' (usado)'}
                        </span>
                      )}
                      {player.power_2kills && (
                        <span className="text-xs text-orange-300">
                          ⚡ {player.power_2kills.replace('_', ' ')}
                          {player.power_2kills_used && ' (usado)'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-sm text-gray-400">Kills</p>
                    <p className="text-xl font-bold text-red-400">{player.kill_count}</p>
                  </div>
                  <button
                    onClick={() => handleRemovePlayer(player.id, player.name)}
                    className="bg-red-600/80 hover:bg-red-600 text-white px-3 py-2 rounded-lg text-sm font-semibold transition-colors"
                    title="Eliminar jugador"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Active Assignments */}
        {assignments.length > 0 && (
          <div className="mb-6 rounded-xl bg-black/30 p-6 backdrop-blur-sm">
            <h2 className="mb-4 text-2xl font-bold text-white">Asignaciones Activas</h2>
            <div className="space-y-3">
              {assignments.map((assignment) => (
                <div
                  key={assignment.id}
                  className="rounded-lg bg-black/40 p-4 backdrop-blur-sm border border-red-500/20"
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <span className="font-semibold text-white truncate">
                        {assignment.hunter_name}
                      </span>
                      <span className="text-red-400 flex-shrink-0">→</span>
                      <span className="font-semibold text-red-300 truncate">
                        {assignment.target_name}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                      <div className="text-sm flex-1 sm:flex-initial">
                        <p className="text-gray-400 text-xs sm:text-sm">
                          📍 {assignment.location}
                        </p>
                        <p className="text-gray-400 text-xs sm:text-sm">
                          🔪 {assignment.weapon}
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedAssignment(assignment);
                          setShowReassignModal(true);
                        }}
                        className="bg-purple-600/80 hover:bg-purple-600 text-white px-3 py-2 rounded-lg text-sm font-semibold transition-colors touch-manipulation flex-shrink-0"
                        title="Reasignar misión"
                      >
                        🔄
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Events */}
        {events.length > 0 && (
          <div className="rounded-xl bg-black/30 p-6 backdrop-blur-sm">
            <h2 className="mb-4 text-2xl font-bold text-white">Historial de Asesinatos</h2>
            <div className="space-y-2">
              {events.map((event) => (
                <div
                  key={event.id}
                  className="rounded-lg bg-black/40 p-3 backdrop-blur-sm border border-gray-500/20"
                >
                  <p className="text-sm text-gray-300">
                    {new Date(event.created_at).toLocaleString('es-ES', {
                      day: '2-digit',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                  <p className="text-white">
                    ⚔️ Asesinato confirmado
                  </p>
                  <p className="text-sm text-gray-400">
                    📍 {event.location} | 🔪 {event.weapon}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Reassignment Modal */}
      {showReassignModal && selectedAssignment && (
        <ReassignmentModal
          isOpen={showReassignModal}
          onClose={() => {
            setShowReassignModal(false);
            setSelectedAssignment(null);
          }}
          gameId={gameId}
          assignmentId={selectedAssignment.id}
          currentHunterName={selectedAssignment.hunter_name || ''}
          currentTargetId={selectedAssignment.target_id}
          currentLocation={selectedAssignment.location}
          currentWeapon={selectedAssignment.weapon}
        />
      )}
    </div>
  );
}
