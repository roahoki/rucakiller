'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import type { Game, Player } from '@/lib/types';
import AssignmentCard from '@/components/AssignmentCard';
import KillConfirmationModal from '@/components/KillConfirmationModal';
import NotificationCenter from '@/components/NotificationCenter';
import SpecialPowerModal from '@/components/SpecialPowerModal';
import PowerSelectionModal from '@/components/PowerSelectionModal';
import InvestigadorModal from '@/components/InvestigadorModal';
import SicarioModal from '@/components/SicarioModal';

export default function GamePage() {
  const params = useParams();
  const router = useRouter();
  const gameId = params.id as string;
  const [game, setGame] = useState<Game | null>(null);
  const [player, setPlayer] = useState<Player | null>(null);
  const [winner, setWinner] = useState<Player | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPowerModal, setShowPowerModal] = useState(false);
  const [showPowerSelectionModal, setShowPowerSelectionModal] = useState(false);
  const [showInvestigadorModal, setShowInvestigadorModal] = useState(false);
  const [showSicarioModal, setShowSicarioModal] = useState(false);
  
  // Guardar props del modal para evitar que se recree cuando player cambia
  const [powerModalProps, setPowerModalProps] = useState<{
    playerId: string;
    playerCharacter: 'espia' | 'detective' | 'saboteador';
  } | null>(null);

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

      // Si el juego terminó, obtener información del ganador
      if (gameData.status === 'finished') {
        const { data: winnerData } = await supabase
          .from('players')
          .select('*')
          .eq('game_id', gameId)
          .eq('is_alive', true)
          .eq('is_game_master', false)
          .single();
        
        if (winnerData) {
          setWinner(winnerData);
        }
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
            // Obtener información del ganador
            supabase
              .from('players')
              .select('*')
              .eq('game_id', gameId)
              .eq('is_alive', true)
              .eq('is_game_master', false)
              .single()
              .then(({ data }) => {
                if (data) {
                  setWinner(data);
                }
              });
          }
        }
      )
      .subscribe();

    // Suscripción a cambios en el jugador (para detectar cuando muere o cambia kill_count)
    const playerId = localStorage.getItem('playerId');
    if (playerId) {
      const playerChannel = supabase
        .channel(`player:${playerId}`)
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'players',
            filter: `id=eq.${playerId}`,
          },
          (payload) => {
            const updatedPlayer = payload.new as Player;
            setPlayer(updatedPlayer);
            console.log('Player updated:', updatedPlayer);
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(gameChannel);
        supabase.removeChannel(playerChannel);
      };
    }

    return () => {
      supabase.removeChannel(gameChannel);
    };
  }, [gameId, router]);

  // Detectar cuando jugador llega a 2 kills y puede elegir poder
  useEffect(() => {
    if (player && player.kill_count >= 2 && !player.power_2kills && player.is_alive) {
      // Mostrar modal de selección de poder
      setShowPowerSelectionModal(true);
    }
  }, [player]);

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
  const isFinished = game.status === 'finished';
  const isWinner = player.id === winner?.id;

  // Función para volver al menú principal
  const handleBackToMenu = () => {
    localStorage.removeItem('playerId');
    localStorage.removeItem('gameId');
    localStorage.removeItem('playerName');
    localStorage.removeItem('isGameMaster');
    router.push('/');
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-red-900 via-red-950 to-black p-4">
      {/* Kill Confirmation Modal */}
      <KillConfirmationModal gameId={gameId} playerId={player.id} />
      
      {/* Special Power Modal */}
      {showPowerModal && powerModalProps && (
        <SpecialPowerModal
          key={powerModalProps.playerId} 
          gameId={gameId}
          playerId={powerModalProps.playerId}
          playerCharacter={powerModalProps.playerCharacter}
          onClose={() => setShowPowerModal(false)}
          onSuccess={() => {
            // Recargar datos del jugador
            supabase
              .from('players')
              .select('*')
              .eq('id', player.id)
              .single()
              .then(({ data }) => {
                if (data) setPlayer(data);
              });
          }}
        />
      )}

      {/* Power Selection Modal (2 kills) */}
      {showPowerSelectionModal && player && (
        <PowerSelectionModal
          gameId={gameId}
          playerId={player.id}
          playerName={player.name}
          onClose={() => setShowPowerSelectionModal(false)}
          onSuccess={() => {
            // Recargar datos del jugador
            supabase
              .from('players')
              .select('*')
              .eq('id', player.id)
              .single()
              .then(({ data }) => {
                if (data) setPlayer(data);
              });
          }}
        />
      )}
      
      <div className="mx-auto max-w-2xl pb-8">
        {/* Header */}
        <div className="mb-8 text-center relative">
          {/* Notification Center - posición absoluta arriba a la derecha */}
          <div className="absolute top-0 right-0">
            <NotificationCenter gameId={gameId} playerId={player.id} />
          </div>
          
          <h1 className="mb-4 text-4xl font-bold text-white">
            🎯 RucaKiller
          </h1>
          <div className="inline-block rounded-lg bg-black/50 px-6 py-3 backdrop-blur-sm">
            <p className="text-sm text-red-200">Código de partida</p>
            <p className="text-2xl font-bold tracking-wider text-white">{game.code}</p>
          </div>
        </div>

        {/* Pantalla de GANADOR (para todos los jugadores) */}
        {isFinished && winner && (
          <div className="mb-6">
            <div className={`rounded-xl p-8 backdrop-blur-sm border-2 text-center ${
              isWinner 
                ? 'bg-gradient-to-br from-yellow-600/50 to-yellow-700/50 border-yellow-400/50'
                : 'bg-gradient-to-br from-purple-900/50 to-purple-950/50 border-purple-400/50'
            }`}>
              <p className="text-6xl mb-4">{isWinner ? '🏆' : '👑'}</p>
              <p className={`text-3xl font-bold mb-2 ${
                isWinner ? 'text-yellow-100' : 'text-purple-100'
              }`}>
                {isWinner ? '¡ERES EL GANADOR!' : `¡${winner.name} GANÓ!`}
              </p>
              <p className={`text-xl mb-4 ${
                isWinner ? 'text-yellow-200' : 'text-purple-200'
              }`}>
                {isWinner ? 'Has ganado RucaKiller' : 'El último asesino en pie'}
              </p>
              <div className="mt-6 rounded-lg bg-black/40 p-4">
                <p className={`text-sm ${
                  isWinner ? 'text-yellow-100/80' : 'text-purple-100/80'
                }`}>
                  Total de asesinatos
                </p>
                <p className={`text-4xl font-bold ${
                  isWinner ? 'text-yellow-300' : 'text-purple-300'
                }`}>
                  🔪 {winner.kill_count}
                </p>
              </div>

              {/* Botón para volver al menú */}
              <button
                onClick={handleBackToMenu}
                className={`mt-6 w-full rounded-lg px-6 py-3 font-semibold transition-all hover:scale-105 ${
                  isWinner
                    ? 'bg-yellow-500 text-yellow-950 hover:bg-yellow-400'
                    : 'bg-purple-600 text-white hover:bg-purple-500'
                }`}
              >
                🏠 Volver al Menú Principal
              </button>
            </div>
          </div>
        )}

        {/* Pantalla cuando GM termina el juego manualmente (sin ganador) */}
        {isFinished && !winner && (
          <div className="mb-6">
            <div className="rounded-xl p-8 backdrop-blur-sm border-2 text-center bg-gradient-to-br from-gray-800/50 to-gray-900/50 border-gray-500/50">
              <p className="text-6xl mb-4">🏁</p>
              <p className="text-3xl font-bold mb-2 text-gray-100">
                Partida Finalizada
              </p>
              <p className="text-xl mb-4 text-gray-300">
                El GameMaster ha terminado la partida
              </p>
              
              {player && player.kill_count > 0 && (
                <div className="mt-6 rounded-lg bg-black/40 p-4">
                  <p className="text-sm text-gray-400">
                    Tus asesinatos
                  </p>
                  <p className="text-4xl font-bold text-red-400">
                    🔪 {player.kill_count}
                  </p>
                </div>
              )}

              {/* Botón para volver al menú */}
              <button
                onClick={handleBackToMenu}
                className="mt-6 w-full rounded-lg px-6 py-3 font-semibold transition-all hover:scale-105 bg-gray-600 text-white hover:bg-gray-500"
              >
                🏠 Volver al Menú Principal
              </button>
            </div>
          </div>
        )}

        {/* Contenido normal si el juego NO ha terminado */}
        {!isFinished && (
          <>
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
                  <p className="text-2xl font-bold text-red-400">🔪 {player.kill_count}</p>
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
                {player.special_character_used ? (
                  <span className="mt-2 inline-block text-xs text-purple-300/70">
                    ✓ Ya usado
                  </span>
                ) : (
                  <button
                    onClick={() => {
                      setPowerModalProps({
                        playerId: player.id,
                        playerCharacter: player.special_character as 'espia' | 'detective' | 'saboteador'
                      });
                      setShowPowerModal(true);
                    }}
                    className="mt-3 w-full rounded-lg bg-purple-600 py-2 font-semibold text-white hover:bg-purple-500 transition-colors"
                  >
                    ⚡ Usar Poder
                  </button>
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
                {player.power_2kills_used ? (
                  <span className="mt-2 inline-block text-xs text-orange-300/70">
                    ✓ Ya usado
                  </span>
                ) : (
                  <>
                    {player.power_2kills === 'investigador' && (
                      <button
                        onClick={() => setShowInvestigadorModal(true)}
                        className="mt-3 w-full rounded-lg bg-blue-600 py-2 font-semibold text-white hover:bg-blue-500 transition-colors"
                      >
                        🔍 Usar Investigador
                      </button>
                    )}
                    {player.power_2kills === 'sicario' && (
                      <button
                        onClick={() => setShowSicarioModal(true)}
                        className="mt-3 w-full rounded-lg bg-purple-600 py-2 font-semibold text-white hover:bg-purple-500 transition-colors"
                      >
                        🎯 Usar Sicario
                      </button>
                    )}
                    {player.power_2kills === 'asesino_serial' && (
                      <p className="mt-2 text-xs text-purple-300">
                        ⚡ Poder pasivo: Puedes asesinar en cualquier lugar
                      </p>
                    )}
                  </>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Investigador Modal */}
      {showInvestigadorModal && player && (
        <InvestigadorModal
          isOpen={showInvestigadorModal}
          onClose={() => setShowInvestigadorModal(false)}
          gameId={gameId}
          playerId={player.id}
        />
      )}

      {/* Sicario Modal */}
      {showSicarioModal && player && (
        <SicarioModal
          isOpen={showSicarioModal}
          onClose={() => setShowSicarioModal(false)}
          gameId={gameId}
          playerId={player.id}
        />
      )}
    </div>
  );
}
