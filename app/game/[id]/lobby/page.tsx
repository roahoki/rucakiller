'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import type { Game, Player } from '@/lib/types';
import GameSetup from './GameSetup';

export default function GameLobby() {
  const params = useParams();
  const gameId = params.id as string;
  const [game, setGame] = useState<Game | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [isConfigured, setIsConfigured] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchGameData = async () => {
      // Obtener información del juego
      const { data: gameData, error: gameError } = await supabase
        .from('games')
        .select('*')
        .eq('id', gameId)
        .single();

      if (gameError) {
        console.error('Error fetching game:', gameError);
      } else {
        setGame(gameData);
      }

      // Obtener lista de jugadores
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

      // Verificar si el juego ya está configurado (lugares y armas)
      const { data: locationsData } = await supabase
        .from('locations')
        .select('id')
        .eq('game_id', gameId);

      const { data: weaponsData } = await supabase
        .from('weapons')
        .select('id')
        .eq('game_id', gameId);

      const hasLocations = (locationsData?.length || 0) >= 5;
      const hasWeapons = (weaponsData?.length || 0) >= 18;
      setIsConfigured(hasLocations && hasWeapons);

      setLoading(false);
    };

    fetchGameData();

    // Suscribirse a cambios en tiempo real
    const playersSubscription = supabase
      .channel(`game-${gameId}-players`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'players',
          filter: `game_id=eq.${gameId}`,
        },
        () => {
          // Refetch players when changes occur
          fetchGameData();
        }
      )
      .subscribe();

    // Suscribirse a cambios en el estado del juego
    const gameSubscription = supabase
      .channel(`game-${gameId}-status`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'games',
          filter: `id=eq.${gameId}`,
        },
        (payload) => {
          const newGame = payload.new as Game;
          // Si el juego cambió a "active", redirigir
          if (newGame.status === 'active') {
            window.location.href = `/game/${gameId}`;
          }
        }
      )
      .subscribe();

    return () => {
      playersSubscription.unsubscribe();
      gameSubscription.unsubscribe();
    };
  }, [gameId]);

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

  const playerName = localStorage.getItem('playerName') || 'Jugador';
  const isGameMaster = localStorage.getItem('isGameMaster') === 'true';
  const gameMaster = players.find((p) => p.is_game_master);

  const handleStartGame = async () => {
    setError('');
    setIsStarting(true);

    try {
      const response = await fetch('/api/game/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ gameId }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Error al iniciar el juego');
        setIsStarting(false);
        return;
      }

      // El juego se inició correctamente, redirigir automáticamente cuando el estado cambie
      // (El useEffect detectará el cambio de estado via Realtime)

    } catch (err) {
      console.error('Error:', err);
      setError('Error inesperado al iniciar el juego');
      setIsStarting(false);
    }
  };

  const handleRemovePlayer = async (playerId: string, playerName: string) => {
    if (!isGameMaster) return;

    const confirmRemove = window.confirm(
      `¿Estás seguro de que quieres eliminar a ${playerName} del lobby?`
    );

    if (!confirmRemove) return;

    try {
      const { error } = await supabase
        .from('players')
        .delete()
        .eq('id', playerId);

      if (error) {
        console.error('Error removing player:', error);
        alert('Error al eliminar el jugador');
      }
    } catch (error) {
      console.error('Error removing player:', error);
      alert('Error al eliminar el jugador');
    }
  };

  return (
    <div className="h-screen w-full overflow-hidden bg-gradient-to-br from-red-900 via-red-950 to-black p-4">
      <div className="h-full overflow-y-auto">
        <div className="mx-auto max-w-4xl">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="mb-2 text-4xl font-bold text-white">Sala de Espera</h1>
            <div className="inline-block rounded-lg bg-black/50 px-6 py-3">
              <p className="text-sm text-red-200">Código de partida:</p>
              <p className="text-3xl font-bold tracking-wider text-white">{game.code}</p>
            </div>
          </div>

          {/* Jugador actual */}
          <div className="mb-6 rounded-lg bg-black/30 p-4 backdrop-blur-sm">
            <p className="text-sm text-gray-400">Conectado como:</p>
            <p className="text-xl font-semibold text-green-400">
              {playerName}
              {isGameMaster && <span className="ml-2 text-yellow-400">👑 GameMaster</span>}
            </p>
          </div>

          {/* Lista de jugadores */}
          <div className="mb-6 rounded-lg bg-black/30 p-6 backdrop-blur-sm">
            <h2 className="mb-4 text-xl font-bold text-white">
              Jugadores en la Sala ({players.length})
            </h2>
            <div className="space-y-3">
              {players.map((player, index) => (
                <div
                  key={player.id}
                  className="flex items-center justify-between rounded-lg bg-black/40 p-4"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <span className="text-2xl">{index + 1}</span>
                    <div>
                      <p className="font-semibold text-white">{player.name}</p>
                      {player.is_game_master && (
                        <p className="text-xs text-yellow-400">👑 GameMaster</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-3 w-3 rounded-full bg-green-500"></div>
                    {isGameMaster && !player.is_game_master && (
                      <button
                        onClick={() => handleRemovePlayer(player.id, player.name)}
                        className="bg-red-600/80 hover:bg-red-600 text-white px-3 py-1 rounded-lg text-sm font-semibold transition-colors"
                        title="Eliminar jugador"
                      >
                        🗑️
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Mensaje de espera o controles GM */}
          {isGameMaster ? (
            <>
              {/* Botón de configuración */}
              {!showConfig && (
                <div className="mb-6 rounded-lg bg-black/30 p-6 text-center backdrop-blur-sm">
                  <p className="mb-4 text-lg font-semibold text-yellow-400">
                    Eres el GameMaster de esta partida
                  </p>
                  
                  {isConfigured ? (
                    <>
                      <div className="mb-4 rounded-lg bg-green-900/50 p-3 text-green-300">
                        ✅ Juego configurado correctamente
                      </div>
                      <button 
                        onClick={() => setShowConfig(true)}
                        className="mb-2 w-full rounded-lg border-2 border-yellow-600 bg-yellow-600/20 px-6 py-2 text-sm font-semibold text-yellow-100 transition-all hover:scale-105 hover:bg-yellow-600/30 active:scale-95"
                        disabled={isStarting}
                      >
                        ⚙️ Re-configurar
                      </button>
                      
                      {error && (
                        <div className="mb-4 rounded-lg border border-red-600 bg-red-900/50 p-3 text-sm text-red-200">
                          {error}
                        </div>
                      )}

                      <button 
                        onClick={handleStartGame}
                        disabled={isStarting}
                        className="w-full rounded-lg bg-green-600 px-8 py-3 font-semibold text-white transition-all hover:scale-105 hover:bg-green-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {isStarting ? '⏳ Iniciando...' : '🎮 Iniciar Juego'}
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="mb-4 rounded-lg bg-yellow-900/50 p-3 text-yellow-300">
                        ⚠️ Debes configurar lugares y armas antes de iniciar
                      </div>
                      <button 
                        onClick={() => setShowConfig(true)}
                        className="w-full rounded-lg bg-yellow-600 px-8 py-3 font-semibold text-white transition-all hover:scale-105 hover:bg-yellow-700 active:scale-95"
                      >
                        ⚙️ Configurar Juego
                      </button>
                    </>
                  )}
                </div>
              )}

              {/* Componente de configuración */}
              {showConfig && (
                <GameSetup 
                  gameId={gameId} 
                  onConfigComplete={() => {
                    setIsConfigured(true);
                    setShowConfig(false);
                  }} 
                />
              )}
            </>
          ) : (
            <div className="rounded-lg bg-black/30 p-6 text-center backdrop-blur-sm">
              <p className="mb-2 text-lg text-red-200">
                Esperando a que <span className="font-bold text-yellow-400">{gameMaster?.name}</span> inicie el juego...
              </p>
              <p className="text-sm text-gray-400">
                Los jugadores se actualizarán en tiempo real
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
