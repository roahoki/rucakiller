'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface SicarioModalProps {
  isOpen: boolean;
  onClose: () => void;
  gameId: string;
  playerId: string;
}

interface Player {
  id: string;
  name: string;
  is_alive: boolean;
}

export default function SicarioModal({
  isOpen,
  onClose,
  gameId,
  playerId,
}: SicarioModalProps) {
  const [players, setPlayers] = useState<Player[]>([]);
  const [selectedPlayerId, setSelectedPlayerId] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    targetName: string;
    location: string;
    weapon: string;
  } | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchPlayers();
    }
  }, [isOpen]);

  const fetchPlayers = async () => {
    // Obtener asignación actual para excluir al objetivo actual
    const { data: currentAssignment } = await supabase
      .from('assignments')
      .select('target_id')
      .eq('hunter_id', playerId)
      .eq('is_active', true)
      .single();

    const { data, error } = await supabase
      .from('players')
      .select('id, name, is_alive')
      .eq('game_id', gameId)
      .eq('is_alive', true)
      .eq('is_game_master', false)
      .neq('id', playerId);

    if (error) {
      console.error('Error fetching players:', error);
    } else {
      // Filtrar el objetivo actual si existe
      const filteredPlayers = currentAssignment
        ? (data || []).filter((p) => p.id !== currentAssignment.target_id)
        : data || [];
      setPlayers(filteredPlayers);
    }
  };

  const handleChooseTarget = async () => {
    if (!selectedPlayerId) {
      alert('Selecciona un jugador como tu nuevo objetivo');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/power/sicario', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          playerId,
          newTargetId: selectedPlayerId,
          gameId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || 'Error al usar el poder');
      } else {
        setResult(data.newAssignment);
      }
    } catch (error) {
      console.error('Error using sicario power:', error);
      alert('Error al usar el poder');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedPlayerId('');
    setResult(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-purple-900 to-purple-950 rounded-2xl p-8 max-w-md w-full border-2 border-purple-500/30 shadow-2xl">
        <h2 className="text-3xl font-bold text-purple-400 mb-6 text-center">
          🎯 Poder Sicario
        </h2>

        {!result ? (
          <>
            <p className="text-purple-200 text-center mb-6">
              Elige manualmente tu próxima víctima
            </p>

            <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
              {players.length === 0 ? (
                <p className="text-purple-300 text-center py-4">
                  No hay otros jugadores disponibles
                </p>
              ) : (
                players.map((player) => (
                  <button
                    key={player.id}
                    onClick={() => setSelectedPlayerId(player.id)}
                    className={`w-full text-left p-4 rounded-lg transition-all ${
                      selectedPlayerId === player.id
                        ? 'bg-purple-600 border-2 border-purple-400'
                        : 'bg-purple-800/50 border-2 border-purple-700/50 hover:bg-purple-700/50'
                    }`}
                  >
                    <p className="text-white font-semibold">{player.name}</p>
                    <p className="text-purple-300 text-sm">
                      {player.is_alive ? '✅ Vivo' : '☠️ Muerto'}
                    </p>
                  </button>
                ))
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleClose}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200"
              >
                Cancelar
              </button>
              <button
                onClick={handleChooseTarget}
                disabled={!selectedPlayerId || loading}
                className="flex-1 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-bold py-3 px-6 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Procesando...' : '🎯 Elegir Objetivo'}
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="bg-purple-950/50 rounded-lg p-6 mb-6 border border-purple-500/30 space-y-4">
              <div className="text-center">
                <p className="text-purple-300 text-sm mb-2">Nuevo objetivo asignado:</p>
                <p className="text-white font-bold text-2xl mb-4">{result.targetName}</p>
              </div>

              <div className="border-t border-purple-500/30 pt-4 space-y-3">
                <div className="bg-purple-900/50 rounded-lg p-3">
                  <p className="text-purple-300 text-xs mb-1">📍 Lugar:</p>
                  <p className="text-white font-semibold">{result.location}</p>
                </div>

                <div className="bg-purple-900/50 rounded-lg p-3">
                  <p className="text-purple-300 text-xs mb-1">🔪 Arma:</p>
                  <p className="text-white font-semibold">{result.weapon}</p>
                </div>
              </div>

              <div className="bg-purple-800/30 rounded-lg p-3 mt-4">
                <p className="text-purple-200 text-sm text-center">
                  💡 Tu nuevo objetivo ha recibido una pista del arma
                </p>
              </div>
            </div>

            <button
              onClick={handleClose}
              className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-bold py-3 px-6 rounded-xl transition-all duration-200"
            >
              Cerrar
            </button>
          </>
        )}
      </div>
    </div>
  );
}
