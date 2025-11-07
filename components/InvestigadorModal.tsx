'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface InvestigadorModalProps {
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

export default function InvestigadorModal({
  isOpen,
  onClose,
  gameId,
  playerId,
}: InvestigadorModalProps) {
  const [players, setPlayers] = useState<Player[]>([]);
  const [selectedPlayerId, setSelectedPlayerId] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    targetName: string;
    victimName: string;
    location: string;
    weapon: string;
  } | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchPlayers();
    }
  }, [isOpen]);

  const fetchPlayers = async () => {
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
      setPlayers(data || []);
    }
  };

  const handleInvestigate = async () => {
    if (!selectedPlayerId) {
      alert('Selecciona un jugador para investigar');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/power/investigador', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          playerId,
          targetPlayerId: selectedPlayerId,
          gameId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || 'Error al usar el poder');
      } else {
        setResult(data.investigation);
      }
    } catch (error) {
      console.error('Error using investigador power:', error);
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
      <div className="bg-gradient-to-br from-blue-900 to-blue-950 rounded-2xl p-8 max-w-md w-full border-2 border-blue-500/30 shadow-2xl">
        <h2 className="text-3xl font-bold text-blue-400 mb-6 text-center">
          🔍 Poder Investigador
        </h2>

        {!result ? (
          <>
            <p className="text-blue-200 text-center mb-6">
              Selecciona un jugador para investigar su objetivo completo
            </p>

            <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
              {players.map((player) => (
                <button
                  key={player.id}
                  onClick={() => setSelectedPlayerId(player.id)}
                  className={`w-full text-left p-4 rounded-lg transition-all ${
                    selectedPlayerId === player.id
                      ? 'bg-blue-600 border-2 border-blue-400'
                      : 'bg-blue-800/50 border-2 border-blue-700/50 hover:bg-blue-700/50'
                  }`}
                >
                  <p className="text-white font-semibold">{player.name}</p>
                  <p className="text-blue-300 text-sm">
                    {player.is_alive ? '✅ Vivo' : '☠️ Muerto'}
                  </p>
                </button>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleClose}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200"
              >
                Cancelar
              </button>
              <button
                onClick={handleInvestigate}
                disabled={!selectedPlayerId || loading}
                className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-3 px-6 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Investigando...' : '🔍 Investigar'}
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="bg-blue-950/50 rounded-lg p-6 mb-6 border border-blue-500/30 space-y-4">
              <div>
                <p className="text-blue-300 text-sm mb-1">Jugador investigado:</p>
                <p className="text-white font-bold text-xl">{result.targetName}</p>
              </div>

              <div className="border-t border-blue-500/30 pt-4">
                <p className="text-blue-300 text-sm mb-3">Su objetivo completo:</p>
                
                <div className="space-y-3">
                  <div className="bg-blue-900/50 rounded-lg p-3">
                    <p className="text-blue-300 text-xs mb-1">🎯 Víctima:</p>
                    <p className="text-white font-semibold">{result.victimName}</p>
                  </div>

                  <div className="bg-blue-900/50 rounded-lg p-3">
                    <p className="text-blue-300 text-xs mb-1">📍 Lugar:</p>
                    <p className="text-white font-semibold">{result.location}</p>
                  </div>

                  <div className="bg-blue-900/50 rounded-lg p-3">
                    <p className="text-blue-300 text-xs mb-1">🔪 Arma:</p>
                    <p className="text-white font-semibold">{result.weapon}</p>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={handleClose}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-3 px-6 rounded-xl transition-all duration-200"
            >
              Cerrar
            </button>
          </>
        )}
      </div>
    </div>
  );
}
