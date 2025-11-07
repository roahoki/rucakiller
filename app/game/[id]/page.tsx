'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import type { Game, Player } from '@/lib/types';
import AssignmentCard from '@/components/AssignmentCard';

export default function GamePage() {
  const params = useParams();
  const router = useRouter();
  const gameId = params.id as string;
  const [game, setGame] = useState<Game | null>(null);
  const [player, setPlayer] = useState<Player | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGameAndPlayer = async () => {
      // Obtener información del juego
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
      
      // Si el juego no está activo, redirigir al lobby
      if (gameData.status === 'lobby') {
        router.push(`/game/${gameId}/lobby`);
        return;
      }

      // Obtener información del jugador desde localStorage
      const playerId = localStorage.getItem('playerId');
      const isGameMaster = localStorage.getItem('isGameMaster') === 'true';

      if (!playerId) {
        console.error('No player ID found');
        router.push('/');
        return;
      }

      // Si es GameMaster, redirigir al dashboard
      if (isGameMaster) {
        router.push(`/game/${gameId}/dashboard`);
        return;
      }

      // Obtener datos del jugador desde la BD
      const { data: playerData, error: playerError } = await supabase
        .from('players')
        .select('*')
        .eq('id', playerId)
        .single();

      if (playerError) {
        console.error('Error fetching player:', playerError);
      } else {
        setPlayer(playerData);
      }

      setLoading(false);
    };

    fetchGameAndPlayer();

    // Suscripción a cambios en el estado del juego
    const gameChannel = supabase
      .channel(`game:${gameId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'games',
          filter: `id=eq.${gameId}`,
        },
        (payload) => {
          const updatedGame = payload.new as Game;
          setGame(updatedGame);

          // Si el juego se pausa o termina, actualizar la UI
          if (updatedGame.status === 'paused') {
            console.log('Game paused');
          } else if (updatedGame.status === 'finished') {
            console.log('Game finished');
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(gameChannel);
    };
  }, [gameId, router]);

  if (loading) {
    return (
      <div className="h-screen w-full overflow-hidden bg-gradient-to-br from-red-900 via-red-950 to-black p-4">
        <div className="flex h-full items-center justify-center">
          <p className="text-white">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!game || !player) {
    return (
      <div className="h-screen w-full overflow-hidden bg-gradient-to-br from-red-900 via-red-950 to-black p-4">
        <div className="flex h-full items-center justify-center">
          <p className="text-red-200">Error al cargar la partida</p>
        </div>
      </div>
    );
  }

  const isPaused = game.status === 'paused';

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-red-900 via-red-950 to-black p-4">
      <div className="mx-auto max-w-2xl pb-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="mb-4 text-4xl font-bold text-white">
            🎯 RucaKiller
          </h1>
          <div className="inline-block rounded-lg bg-black/50 px-6 py-3 backdrop-blur-sm">
            <p className="text-sm text-red-200">Código de partida</p>
            <p className="text-2xl font-bold tracking-wider text-white">{game.code}</p>
          </div>
        </div>

        {/* Paused banner */}
        {isPaused && (
          <div className="mb-6 rounded-xl bg-yellow-600/20 p-4 backdrop-blur-sm border-2 border-yellow-500/50 animate-pulse">
            <p className="text-center text-lg font-semibold text-yellow-200">
              ⏸️ Juego en pausa
            </p>
            <p className="text-center text-sm text-yellow-100/70 mt-1">
              El GameMaster ha pausado temporalmente el juego
            </p>
          </div>
        )}

        {/* Player status */}
        <div className="mb-6 rounded-xl bg-black/30 p-5 backdrop-blur-sm border border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Tu nombre</p>
              <p className="text-xl font-semibold text-white">{player.name}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-400">Estado</p>
              <p className={`text-lg font-bold ${player.is_alive ? 'text-green-400' : 'text-red-400'}`}>
                {player.is_alive ? '✅ Vivo' : '☠️ Eliminado'}
              </p>
            </div>
          </div>
          
          {player.kill_count > 0 && (
            <div className="mt-4 pt-4 border-t border-white/10">
              <p className="text-sm text-gray-400">Asesinatos exitosos</p>
              <p className="text-2xl font-bold text-red-400">� {player.kill_count}</p>
            </div>
          )}
        </div>

        {/* Assignment card - solo si está vivo */}
        {player.is_alive ? (
          <AssignmentCard gameId={gameId} playerId={player.id} />
        ) : (
          <div className="rounded-xl bg-gradient-to-br from-gray-800/50 to-gray-900/50 p-8 backdrop-blur-sm border-2 border-gray-500/50 text-center">
            <p className="text-4xl mb-4">☠️</p>
            <p className="text-2xl font-bold text-gray-300 mb-2">Has sido eliminado</p>
            <p className="text-gray-400">Ya no tienes objetivos activos</p>
          </div>
        )}

        {/* Special character badge (si tiene) */}
        {player.special_character && (
          <div className="mt-6 rounded-xl bg-purple-900/30 p-5 backdrop-blur-sm border border-purple-500/30">
            <p className="text-sm text-purple-300 mb-1">🎭 Personaje especial</p>
            <p className="text-xl font-bold text-purple-100 capitalize">
              {player.special_character}
            </p>
            {player.special_character_used && (
              <span className="mt-2 inline-block text-xs text-purple-300/70">
                ✓ Ya usado
              </span>
            )}
          </div>
        )}

        {/* Power badge (si tiene) */}
        {player.power_2kills && (
          <div className="mt-4 rounded-xl bg-orange-900/30 p-5 backdrop-blur-sm border border-orange-500/30">
            <p className="text-sm text-orange-300 mb-1">⚡ Poder especial</p>
            <p className="text-xl font-bold text-orange-100 capitalize">
              {player.power_2kills.replace('_', ' ')}
            </p>
            {player.power_2kills_used && (
              <span className="mt-2 inline-block text-xs text-orange-300/70">
                ✓ Ya usado
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
