'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface PowerSelectionModalProps {
  gameId: string;
  playerId: string;
  playerName: string;
  onClose: () => void;
  onSuccess: () => void;
}

interface AvailablePower {
  id: string;
  power_name: string;
  is_taken: boolean;
  taken_by_player_id: string | null;
}

const powerInfo = {
  asesino_serial: {
    name: 'Asesino Serial',
    icon: '🔪',
    description: 'Puedes asesinar en cualquier lugar (solo necesitas el arma correcta)',
    contra: 'CONTRA: Tu cazador también puede asesinarte en cualquier lugar',
    color: 'from-red-600 to-red-700',
  },
  investigador: {
    name: 'Investigador',
    icon: '🔍',
    description: 'Puedes ver el objetivo completo de otro jugador (nombre + condiciones)',
    contra: 'El jugador investigado recibirá una notificación',
    color: 'from-blue-600 to-blue-700',
  },
  sicario: {
    name: 'Sicario',
    icon: '🎯',
    description: 'Puedes elegir manualmente tu próxima víctima',
    contra: 'Tu nueva víctima recibirá una pista sobre el arma con la que la cazas',
    color: 'from-purple-600 to-purple-700',
  },
};

export default function PowerSelectionModal({
  gameId,
  playerId,
  playerName,
  onClose,
  onSuccess,
}: PowerSelectionModalProps) {
  const [loading, setLoading] = useState(false);
  const [powers, setPowers] = useState<AvailablePower[]>([]);
  const [selectedPower, setSelectedPower] = useState<string | null>(null);

  useEffect(() => {
    const fetchAvailablePowers = async () => {
      const { data, error } = await supabase
        .from('available_powers')
        .select('*')
        .eq('game_id', gameId)
        .order('power_name', { ascending: true });

      if (!error && data) {
        setPowers(data);
      }
    };

    fetchAvailablePowers();
  }, [gameId]);

  const handleSelectPower = async () => {
    if (!selectedPower) {
      alert('Selecciona un poder');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/power/select', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playerId,
          gameId,
          powerName: selectedPower,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert(`✅ ${data.message}`);
        onSuccess();
        onClose();
      } else {
        alert(`❌ ${data.error}`);
        setLoading(false);
      }
    } catch (error) {
      console.error('Error selecting power:', error);
      alert('Error al seleccionar el poder');
      setLoading(false);
    }
  };

  const availablePowers = powers.filter(p => !p.is_taken);
  const takenPowers = powers.filter(p => p.is_taken);

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm" />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="relative w-full max-w-2xl rounded-xl bg-gradient-to-br from-orange-900 to-orange-950 p-6 shadow-2xl border-2 border-orange-500/50 max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="mb-6 text-center">
            <div className="mb-2 text-6xl">⚡</div>
            <h2 className="mb-2 text-3xl font-bold text-white">
              ¡Felicidades {playerName}!
            </h2>
            <p className="text-orange-200">
              Has logrado <strong>2 kills</strong> y puedes elegir un <strong>poder especial</strong>
            </p>
          </div>

          {/* Available Powers */}
          {availablePowers.length > 0 ? (
            <div className="space-y-4 mb-6">
              <h3 className="text-xl font-bold text-white mb-3">
                Poderes Disponibles:
              </h3>
              {availablePowers.map((power) => {
                const info = powerInfo[power.power_name as keyof typeof powerInfo];
                const isSelected = selectedPower === power.power_name;

                return (
                  <button
                    key={power.id}
                    onClick={() => setSelectedPower(power.power_name)}
                    disabled={loading}
                    className={`w-full rounded-xl p-5 transition-all border-2 ${
                      isSelected
                        ? 'border-orange-400 bg-orange-800/50 scale-105'
                        : 'border-orange-500/30 bg-black/30 hover:bg-black/50 hover:border-orange-400/50'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="text-5xl">{info.icon}</div>
                      <div className="flex-1 text-left">
                        <h4 className="text-xl font-bold text-white mb-2">
                          {info.name}
                        </h4>
                        <p className="text-sm text-green-200 mb-2">
                          ✅ {info.description}
                        </p>
                        <p className="text-sm text-red-200">
                          ⚠️ {info.contra}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="mb-6 rounded-lg bg-red-900/30 p-4 border border-red-500/50 text-center">
              <p className="text-red-200">
                ⚠️ Todos los poderes ya han sido tomados por otros jugadores
              </p>
            </div>
          )}

          {/* Taken Powers */}
          {takenPowers.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-bold text-gray-300 mb-2">
                Poderes ya tomados:
              </h3>
              <div className="space-y-2">
                {takenPowers.map((power) => {
                  const info = powerInfo[power.power_name as keyof typeof powerInfo];
                  return (
                    <div
                      key={power.id}
                      className="rounded-lg bg-gray-900/50 p-3 border border-gray-500/30"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-3xl opacity-50">{info.icon}</span>
                        <div className="flex-1">
                          <p className="font-semibold text-gray-400">
                            {info.name}
                          </p>
                        </div>
                        <span className="text-xs text-gray-500">Ya tomado</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 rounded-lg bg-gray-700 px-4 py-3 font-semibold text-white hover:bg-gray-600 transition-colors"
              disabled={loading}
            >
              Decidir Después
            </button>
            {availablePowers.length > 0 && (
              <button
                onClick={handleSelectPower}
                disabled={loading || !selectedPower}
                className="flex-1 rounded-lg bg-gradient-to-r from-orange-600 to-orange-700 px-4 py-3 font-semibold text-white hover:from-orange-700 hover:to-orange-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Seleccionando...' : '⚡ Elegir Poder'}
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
