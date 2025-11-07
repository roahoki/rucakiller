'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { Weapon } from '@/lib/types';

interface GameSetupProps {
  gameId: string;
  onConfigComplete: () => void;
}

export default function GameSetup({ gameId, onConfigComplete }: GameSetupProps) {
  const [locations, setLocations] = useState<string[]>(['', '', '', '', '']);
  const [weapons, setWeapons] = useState<string[]>(Array(18).fill(''));
  const [dbWeapons, setDbWeapons] = useState<Weapon[]>([]);
  const [newWeaponName, setNewWeaponName] = useState('');
  const [addingWeapon, setAddingWeapon] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showWeapons, setShowWeapons] = useState(false);
  const [playerCount, setPlayerCount] = useState(0);

  // Precargar valores por defecto
  useEffect(() => {
    const defaultLocations = [
      'Piscina (Cerca)',
      'Quincho',
      'Puente',
      'Comedor Principal',
      'Casa Principal'
    ];
    const defaultWeapons = [
      'Ukelele',
      'Golo',
      'Extintor',
      'Lana',
      'Tarjeta BIP',
      'Pokeball',
      'Envase silicona',
      'Lima de uñas',
      'Peluche pulpo',
      'Balón de voleibol',
      'Bombín de balones',
      'Aro verde de malabares',
      'Aro amarillo de malabares',
      'Aro naranjo de malabares',
      'Pirámide Rubik',
      'Botella de perfume',
      'Anillo apretable amarillo',
      'Rodillo de cara'
    ];
    setLocations(defaultLocations);
    setWeapons(defaultWeapons);

    // Cargar armas existentes desde la BD
    fetchWeaponsFromDB();
    fetchPlayerCount();

    // Suscripción en tiempo real a cambios en armas
    const weaponsChannel = supabase
      .channel(`weapons:${gameId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'weapons',
          filter: `game_id=eq.${gameId}`,
        },
        () => {
          fetchWeaponsFromDB();
        }
      )
      .subscribe();

    // Suscripción a cambios en jugadores (para actualizar el conteo)
    const playersChannel = supabase
      .channel(`players:${gameId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'players',
          filter: `game_id=eq.${gameId}`,
        },
        () => {
          fetchPlayerCount();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(weaponsChannel);
      supabase.removeChannel(playersChannel);
    };
  }, [gameId]);

  const fetchWeaponsFromDB = async () => {
    const { data, error } = await supabase
      .from('weapons')
      .select('*')
      .eq('game_id', gameId)
      .order('created_at');

    if (!error && data) {
      setDbWeapons(data);
    }
  };

  const fetchPlayerCount = async () => {
    const { count } = await supabase
      .from('players')
      .select('*', { count: 'exact', head: true })
      .eq('game_id', gameId)
      .eq('is_game_master', false);

    setPlayerCount(count || 0);
  };

  const handleAddWeapon = async () => {
    if (!newWeaponName.trim()) {
      setError('Ingresa un nombre para el arma');
      return;
    }

    setAddingWeapon(true);
    setError('');

    try {
      const response = await fetch('/api/gamemaster/weapons/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          gameId,
          weaponName: newWeaponName.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Error al agregar arma');
      } else {
        setNewWeaponName('');
        await fetchWeaponsFromDB();
      }
    } catch (err) {
      console.error('Error adding weapon:', err);
      setError('Error al agregar arma');
    } finally {
      setAddingWeapon(false);
    }
  };

  const handleRemoveWeapon = async (weaponId: string, weaponName: string) => {
    if (!confirm(`¿Eliminar el arma "${weaponName}"?`)) {
      return;
    }

    setError('');

    try {
      const response = await fetch('/api/gamemaster/weapons/remove', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          gameId,
          weaponId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Error al eliminar arma');
      } else {
        await fetchWeaponsFromDB();
      }
    } catch (err) {
      console.error('Error removing weapon:', err);
      setError('Error al eliminar arma');
    }
  };

  const handleLocationChange = (index: number, value: string) => {
    const newLocations = [...locations];
    newLocations[index] = value;
    setLocations(newLocations);
  };

  const handleWeaponChange = (index: number, value: string) => {
    const newWeapons = [...weapons];
    newWeapons[index] = value;
    setWeapons(newWeapons);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validar que todos los campos estén llenos
    const filledLocations = locations.filter(l => l.trim() !== '');
    const filledWeapons = weapons.filter(w => w.trim() !== '');

    if (filledLocations.length < 5) {
      setError('Debes ingresar al menos 5 lugares');
      return;
    }

    if (filledWeapons.length < 18) {
      setError('Debes ingresar las 18 armas');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/game/configure', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          gameId,
          locations: filledLocations,
          weapons: filledWeapons,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Error al guardar la configuración');
        setIsLoading(false);
        return;
      }

      // Notificar que la configuración está completa
      onConfigComplete();

    } catch (err) {
      console.error('Error:', err);
      setError('Error inesperado. Intenta nuevamente.');
      setIsLoading(false);
    }
  };

  return (
    <div className="rounded-lg bg-black/30 p-6 backdrop-blur-sm">
      <h2 className="mb-4 text-xl font-bold text-yellow-400">⚙️ Configuración del Juego</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Lugares */}
        <div>
          <label className="mb-2 block text-sm font-medium text-red-100">
            Lugares del Juego (5 requeridos)
          </label>
          <div className="space-y-2">
            {locations.map((location, index) => (
              <input
                key={`location-${index}`}
                type="text"
                value={location}
                onChange={(e) => handleLocationChange(index, e.target.value)}
                placeholder={`Lugar ${index + 1}`}
                className="w-full rounded-lg border-2 border-red-600 bg-black/50 px-4 py-2 text-white placeholder-gray-400 focus:border-red-500 focus:outline-none"
                maxLength={50}
                disabled={isLoading}
              />
            ))}
          </div>
        </div>

        {/* Gestión de Armas desde BD */}
        <div className="rounded-lg border-2 border-purple-500/50 bg-purple-900/20 p-4">
          <h3 className="mb-3 text-lg font-bold text-purple-200 flex items-center gap-2">
            🔪 Gestión de Armas
            <span className="text-sm font-normal text-purple-300">
              ({dbWeapons.length} armas / mínimo {playerCount} jugadores)
            </span>
          </h3>

          {/* Agregar nueva arma */}
          <div className="mb-4 flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={newWeaponName}
              onChange={(e) => setNewWeaponName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddWeapon();
                }
              }}
              placeholder="Nombre del arma nueva"
              className="flex-1 rounded-lg border-2 border-purple-500 bg-black/50 px-4 py-2 text-white placeholder-gray-400 focus:border-purple-400 focus:outline-none touch-manipulation"
              maxLength={50}
              disabled={addingWeapon}
            />
            <button
              type="button"
              onClick={handleAddWeapon}
              disabled={addingWeapon || !newWeaponName.trim()}
              className="rounded-lg bg-purple-600 px-4 py-2 font-semibold text-white hover:bg-purple-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation flex-shrink-0"
            >
              {addingWeapon ? '⏳' : '➕'} Agregar
            </button>
          </div>

          {/* Lista de armas */}
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {dbWeapons.length === 0 ? (
              <p className="text-sm text-purple-300 text-center py-4">
                No hay armas configuradas. Agrega al menos {playerCount} armas.
              </p>
            ) : (
              dbWeapons.map((weapon) => (
                <div
                  key={weapon.id}
                  className="flex items-center justify-between rounded-lg bg-black/40 p-3 backdrop-blur-sm border border-purple-500/20"
                >
                  <span className="text-white font-medium truncate flex-1 min-w-0">
                    🔪 {weapon.name}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveWeapon(weapon.id, weapon.name)}
                    className="ml-2 bg-red-600/80 hover:bg-red-600 text-white px-3 py-1 rounded-lg text-sm font-semibold transition-colors touch-manipulation flex-shrink-0"
                    title="Eliminar arma"
                  >
                    🗑️
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Advertencia si faltan armas */}
          {dbWeapons.length < playerCount && (
            <div className="mt-3 rounded-lg bg-yellow-900/40 border border-yellow-500/50 p-3">
              <p className="text-sm text-yellow-200 font-semibold">
                ⚠️ Necesitas al menos {playerCount} armas para {playerCount} jugadores
              </p>
            </div>
          )}
        </div>

        {/* Toggle para mostrar armas */}
        <button
          type="button"
          onClick={() => setShowWeapons(!showWeapons)}
          className="w-full rounded-lg border-2 border-yellow-600 bg-yellow-600/20 px-4 py-2 text-yellow-100 transition-all hover:bg-yellow-600/30"
        >
          {showWeapons ? '▼' : '▶'} Armas (18 requeridas) - {showWeapons ? 'Ocultar' : 'Mostrar'}
        </button>

        {/* Armas (colapsable) */}
        {showWeapons && (
          <div>
            <div className="grid grid-cols-2 gap-2">
              {weapons.map((weapon, index) => (
                <input
                  key={`weapon-${index}`}
                  type="text"
                  value={weapon}
                  onChange={(e) => handleWeaponChange(index, e.target.value)}
                  placeholder={`Arma ${index + 1}`}
                  className="rounded-lg border-2 border-red-600 bg-black/50 px-3 py-2 text-sm text-white placeholder-gray-400 focus:border-red-500 focus:outline-none"
                  maxLength={50}
                  disabled={isLoading}
                />
              ))}
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="rounded-lg border border-red-600 bg-red-900/50 p-3 text-sm text-red-200">
            {error}
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-lg bg-green-600 px-6 py-3 font-semibold text-white transition-all hover:scale-105 hover:bg-green-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLoading ? '⏳ Guardando...' : '💾 Guardar Configuración'}
        </button>
      </form>
    </div>
  );
}
