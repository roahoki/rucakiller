'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface SpecialPowerModalProps {
  gameId: string;
  playerId: string;
  playerCharacter: 'espia' | 'detective' | 'saboteador';
  onClose: () => void;
  onSuccess: () => void;
}

interface Player {
  id: string;
  name: string;
  is_alive: boolean;
}

interface Location {
  name: string;
}

interface Weapon {
  name: string;
}

export default function SpecialPowerModal({
  gameId,
  playerId,
  playerCharacter,
  onClose,
  onSuccess,
}: SpecialPowerModalProps) {
  const [loading, setLoading] = useState(false);
  const [players, setPlayers] = useState<Player[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [weapons, setWeapons] = useState<Weapon[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [shouldUpdate, setShouldUpdate] = useState(false);  // Flag para indicar que se usó el poder
  
  // Para Saboteador
  const [changeType, setChangeType] = useState<'location' | 'weapon'>('location');
  const [newValue, setNewValue] = useState('');
  const [targetAssignment, setTargetAssignment] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      // Obtener jugadores vivos (excepto yo)
      const { data: playersData } = await supabase
        .from('players')
        .select('id, name, is_alive')
        .eq('game_id', gameId)
        .eq('is_game_master', false)
        .eq('is_alive', true)
        .neq('id', playerId);

      if (playersData) setPlayers(playersData);

      // Si es saboteador, cargar lugares y armas
      if (playerCharacter === 'saboteador') {
        const { data: locationsData } = await supabase
          .from('locations')
          .select('name')
          .eq('game_id', gameId);

        const { data: weaponsData } = await supabase
          .from('weapons')
          .select('name')
          .eq('game_id', gameId);

        if (locationsData) setLocations(locationsData);
        if (weaponsData) setWeapons(weaponsData);
      }
    };

    fetchData();
  }, [gameId, playerId, playerCharacter]);

  // Para Saboteador: obtener asignación del jugador seleccionado
  useEffect(() => {
    if (playerCharacter === 'saboteador' && selectedPlayer) {
      const fetchAssignment = async () => {
        const { data } = await supabase
          .from('assignments')
          .select('location, weapon')
          .eq('game_id', gameId)
          .eq('hunter_id', selectedPlayer)
          .eq('is_active', true)
          .single();

        setTargetAssignment(data);
      };

      fetchAssignment();
    }
  }, [selectedPlayer, gameId, playerCharacter]);

  const handleEspia = async () => {
    if (!selectedPlayer) {
      alert('Selecciona un jugador');
      return;
    }

    setLoading(true);
    console.log('🎯 Iniciando poder Espía...');

    try {
      const response = await fetch('/api/power/espia', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playerId,
          targetPlayerId: selectedPlayer,
          gameId,
        }),
      });

      const data = await response.json();
      console.log('📦 Respuesta del servidor:', data);

      if (response.ok) {
        console.log('✅ Éxito! Actualizando resultado con:', data.message);
        setResult(data.message);
        setShouldUpdate(true);  // Marcar para actualizar al cerrar
        setLoading(false);
      } else {
        console.error('❌ Error en la respuesta:', data);
        alert(data.error || 'Error al usar el poder');
        setLoading(false);
      }
    } catch (error) {
      console.error('💥 Excepción capturada:', error);
      alert('Error al usar el poder');
      setLoading(false);
    }
  };

  const handleDetective = async () => {
    setLoading(true);
    console.log('🔍 Iniciando poder Detective...');

    try {
      const response = await fetch('/api/power/detective', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playerId,
          gameId,
        }),
      });

      const data = await response.json();
      console.log('📦 Respuesta del servidor:', data);

      if (response.ok) {
        console.log('✅ Éxito! Actualizando resultado con:', data.message);
        setResult(data.message);
        setShouldUpdate(true);  // Marcar para actualizar al cerrar
        setLoading(false);
      } else {
        console.error('❌ Error en la respuesta:', data);
        alert(data.error || 'Error al usar el poder');
        setLoading(false);
      }
    } catch (error) {
      console.error('💥 Excepción capturada:', error);
      alert('Error al usar el poder');
      setLoading(false);
    }
  };

  const handleSaboteador = async () => {
    if (!selectedPlayer || !newValue) {
      alert('Completa todos los campos');
      return;
    }

    setLoading(true);
    console.log('💣 Iniciando poder Saboteador...');

    try {
      const response = await fetch('/api/power/saboteador', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playerId,
          targetPlayerId: selectedPlayer,
          gameId,
          changeType,
          newValue,
        }),
      });

      const data = await response.json();
      console.log('📦 Respuesta del servidor:', data);

      if (response.ok) {
        console.log('✅ Éxito! Actualizando resultado con:', data.message);
        setResult(data.message);
        setShouldUpdate(true);  // Marcar para actualizar al cerrar
        setLoading(false);
      } else {
        console.error('❌ Error en la respuesta:', data);
        alert(data.error || 'Error al usar el poder');
        setLoading(false);
      }
    } catch (error) {
      console.error('💥 Excepción capturada:', error);
      alert('Error al usar el poder');
      setLoading(false);
    }
  };

  const handleSubmit = () => {
    console.log('🚀 handleSubmit llamado para:', playerCharacter);
    if (playerCharacter === 'espia') handleEspia();
    else if (playerCharacter === 'detective') handleDetective();
    else if (playerCharacter === 'saboteador') handleSaboteador();
  };

  const handleClose = () => {
    console.log('🔒 Cerrando modal...');
    // Solo actualizar datos del jugador si se usó el poder
    if (shouldUpdate) {
      console.log('🔄 Actualizando datos del jugador...');
      onSuccess();
    }
    onClose();
  };

  console.log('🎭 Modal renderizado. Estado actual:');
  console.log('  - loading:', loading);
  console.log('  - result:', result);
  console.log('  - playerCharacter:', playerCharacter);
  console.log('  - ¿Mostrar resultado?', result !== null);

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm" 
        onClick={(e) => {
          e.stopPropagation();
          if (!loading) onClose();
        }} 
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div 
          className="relative w-full max-w-md rounded-xl bg-gradient-to-br from-purple-900 to-purple-950 p-6 shadow-2xl border-2 border-purple-500/50 pointer-events-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 text-white/70 hover:text-white text-2xl"
            disabled={loading}
          >
            ×
          </button>

          <h2 className="mb-4 text-2xl font-bold text-white">
            🎭 Poder de {playerCharacter === 'espia' ? 'Espía' : playerCharacter === 'detective' ? 'Detective' : 'Saboteador'}
          </h2>

          {result ? (
            <div className="space-y-4">
              {/* Resultado destacado */}
              <div className="rounded-lg bg-gradient-to-br from-green-900/50 to-green-800/50 p-6 border-2 border-green-500/50 shadow-xl">
                <div className="flex items-center justify-center mb-3">
                  <span className="text-4xl">✅</span>
                </div>
                <p className="text-green-100 text-center text-lg font-semibold leading-relaxed">
                  {result}
                </p>
              </div>
              
              {/* Botón para cerrar y actualizar */}
              <button
                onClick={handleClose}
                className="w-full rounded-lg bg-purple-600 px-4 py-3 font-semibold text-white hover:bg-purple-500 transition-colors"
              >
                Entendido
              </button>
            </div>
          ) : (
            <>
              {/* Espía: Seleccionar jugador */}
              {playerCharacter === 'espia' && (
                <div className="space-y-4">
                  <p className="text-sm text-purple-200">
                    Puedes ver el <strong>nombre del objetivo</strong> de otro jugador (sin condiciones).
                  </p>
                  <select
                    value={selectedPlayer}
                    onChange={(e) => setSelectedPlayer(e.target.value)}
                    className="w-full rounded-lg bg-black/40 px-4 py-3 text-white border border-purple-500/30"
                    disabled={loading}
                  >
                    <option value="">Selecciona un jugador...</option>
                    {players.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Detective: Solo botón */}
              {playerCharacter === 'detective' && (
                <div className="space-y-4">
                  <p className="text-sm text-purple-200">
                    Recibirás una pista: <strong>lugar + arma</strong> de una asignación aleatoria (sin nombres de jugadores).
                  </p>
                </div>
              )}

              {/* Saboteador: Seleccionar jugador + condición */}
              {playerCharacter === 'saboteador' && (
                <div className="space-y-4">
                  <p className="text-sm text-purple-200 mb-3">
                    Puedes cambiar <strong>UNA condición</strong> (lugar O arma) de otro jugador. Él NO será notificado.
                  </p>

                  <select
                    value={selectedPlayer}
                    onChange={(e) => setSelectedPlayer(e.target.value)}
                    className="w-full rounded-lg bg-black/40 px-4 py-3 text-white border border-purple-500/30"
                    disabled={loading}
                  >
                    <option value="">Selecciona un jugador...</option>
                    {players.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>

                  {targetAssignment && (
                    <div className="rounded-lg bg-black/30 p-3 text-sm text-gray-300">
                      <p><strong>Condiciones actuales:</strong></p>
                      <p>📍 Lugar: {targetAssignment.location}</p>
                      <p>🔪 Arma: {targetAssignment.weapon}</p>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button
                      onClick={() => setChangeType('location')}
                      className={`flex-1 rounded-lg px-4 py-2 font-semibold transition-colors ${
                        changeType === 'location'
                          ? 'bg-purple-600 text-white'
                          : 'bg-black/40 text-gray-400'
                      }`}
                      disabled={loading}
                    >
                      📍 Lugar
                    </button>
                    <button
                      onClick={() => setChangeType('weapon')}
                      className={`flex-1 rounded-lg px-4 py-2 font-semibold transition-colors ${
                        changeType === 'weapon'
                          ? 'bg-purple-600 text-white'
                          : 'bg-black/40 text-gray-400'
                      }`}
                      disabled={loading}
                    >
                      🔪 Arma
                    </button>
                  </div>

                  <select
                    value={newValue}
                    onChange={(e) => setNewValue(e.target.value)}
                    className="w-full rounded-lg bg-black/40 px-4 py-3 text-white border border-purple-500/30"
                    disabled={loading || !selectedPlayer}
                  >
                    <option value="">Selecciona nuevo {changeType === 'location' ? 'lugar' : 'arma'}...</option>
                    {changeType === 'location'
                      ? locations.map((l) => (
                          <option key={l.name} value={l.name}>
                            {l.name}
                          </option>
                        ))
                      : weapons.map((w) => (
                          <option key={w.name} value={w.name}>
                            {w.name}
                          </option>
                        ))}
                  </select>
                </div>
              )}

              <div className="mt-6 flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 rounded-lg bg-gray-700 px-4 py-3 font-semibold text-white hover:bg-gray-600 transition-colors"
                  disabled={loading}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSubmit}
                  className="flex-1 rounded-lg bg-purple-600 px-4 py-3 font-semibold text-white hover:bg-purple-500 transition-colors disabled:opacity-50"
                  disabled={loading || (playerCharacter === 'espia' && !selectedPlayer)}
                >
                  {loading ? 'Usando...' : 'Usar Poder'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
