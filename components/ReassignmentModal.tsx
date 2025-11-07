'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Player, Location, Weapon } from '@/lib/types';

interface ReassignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  gameId: string;
  assignmentId: string;
  currentHunterName: string;
  currentTargetId: string;
  currentLocation: string;
  currentWeapon: string;
}

export default function ReassignmentModal({
  isOpen,
  onClose,
  gameId,
  assignmentId,
  currentHunterName,
  currentTargetId,
  currentLocation,
  currentWeapon,
}: ReassignmentModalProps) {
  const [alivePlayers, setAlivePlayers] = useState<Player[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [weapons, setWeapons] = useState<Weapon[]>([]);
  const [selectedTargetId, setSelectedTargetId] = useState(currentTargetId);
  const [selectedLocation, setSelectedLocation] = useState(currentLocation);
  const [selectedWeapon, setSelectedWeapon] = useState(currentWeapon);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchData();
    }
  }, [isOpen, gameId]);

  const fetchData = async () => {
    // Obtener jugadores vivos
    const { data: playersData } = await supabase
      .from('players')
      .select('*')
      .eq('game_id', gameId)
      .eq('is_alive', true)
      .eq('is_game_master', false)
      .order('name');

    if (playersData) {
      setAlivePlayers(playersData);
    }

    // Obtener locaciones
    const { data: locationsData } = await supabase
      .from('locations')
      .select('*')
      .eq('game_id', gameId)
      .order('name');

    if (locationsData) {
      setLocations(locationsData);
    }

    // Obtener armas
    const { data: weaponsData } = await supabase
      .from('weapons')
      .select('*')
      .eq('game_id', gameId)
      .order('name');

    if (weaponsData) {
      setWeapons(weaponsData);
    }
  };

  const handleReassign = async () => {
    setLoading(true);

    try {
      const response = await fetch('/api/gamemaster/reassign', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          gameId,
          assignmentId,
          newTargetId: selectedTargetId !== currentTargetId ? selectedTargetId : undefined,
          newLocation: selectedLocation !== currentLocation ? selectedLocation : undefined,
          newWeapon: selectedWeapon !== currentWeapon ? selectedWeapon : undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || 'Error al reasignar');
      } else {
        alert('✅ Reasignación exitosa');
        onClose();
      }
    } catch (error) {
      console.error('Error reassigning:', error);
      alert('Error al reasignar');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const hasChanges = 
    selectedTargetId !== currentTargetId ||
    selectedLocation !== currentLocation ||
    selectedWeapon !== currentWeapon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-md rounded-xl bg-gradient-to-br from-purple-900/95 to-purple-950/95 p-4 sm:p-6 shadow-2xl border-2 border-purple-500/50 backdrop-blur-sm max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="mb-4 sm:mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            🔄 Reasignar Misión
          </h2>
          <p className="text-sm text-purple-200 mt-2">
            Cazador: <span className="font-semibold">{currentHunterName}</span>
          </p>
        </div>

        {/* Target Selection */}
        <div className="mb-4">
          <label className="block text-sm font-semibold text-purple-200 mb-2">
            Nuevo Objetivo
          </label>
          <select
            value={selectedTargetId}
            onChange={(e) => setSelectedTargetId(e.target.value)}
            className="w-full rounded-lg bg-purple-950/50 border-2 border-purple-500/30 p-3 text-white focus:border-purple-400 focus:outline-none transition-colors touch-manipulation"
          >
            {alivePlayers.map((player) => (
              <option key={player.id} value={player.id}>
                {player.name} {player.id === currentTargetId ? '(actual)' : ''}
              </option>
            ))}
          </select>
        </div>

        {/* Location Selection */}
        <div className="mb-4">
          <label className="block text-sm font-semibold text-purple-200 mb-2">
            Nuevo Lugar
          </label>
          <select
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            className="w-full rounded-lg bg-purple-950/50 border-2 border-purple-500/30 p-3 text-white focus:border-purple-400 focus:outline-none transition-colors touch-manipulation"
          >
            {locations.map((location) => (
              <option key={location.id} value={location.name}>
                {location.name} {location.name === currentLocation ? '(actual)' : ''}
              </option>
            ))}
          </select>
        </div>

        {/* Weapon Selection */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-purple-200 mb-2">
            Nueva Arma
          </label>
          <select
            value={selectedWeapon}
            onChange={(e) => setSelectedWeapon(e.target.value)}
            className="w-full rounded-lg bg-purple-950/50 border-2 border-purple-500/30 p-3 text-white focus:border-purple-400 focus:outline-none transition-colors touch-manipulation"
          >
            {weapons.map((weapon) => (
              <option key={weapon.id} value={weapon.name}>
                {weapon.name} {weapon.name === currentWeapon ? '(actual)' : ''}
              </option>
            ))}
          </select>
        </div>

        {/* Changes Summary */}
        {hasChanges && (
          <div className="mb-4 rounded-lg bg-yellow-900/30 border border-yellow-500/50 p-3">
            <p className="text-xs sm:text-sm text-yellow-200 font-semibold mb-2">
              📝 Cambios a realizar:
            </p>
            <ul className="text-xs sm:text-sm text-yellow-100 space-y-1">
              {selectedTargetId !== currentTargetId && (
                <li>• Objetivo: {alivePlayers.find(p => p.id === selectedTargetId)?.name}</li>
              )}
              {selectedLocation !== currentLocation && (
                <li>• Lugar: {selectedLocation}</li>
              )}
              {selectedWeapon !== currentWeapon && (
                <li>• Arma: {selectedWeapon}</li>
              )}
            </ul>
          </div>
        )}

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-lg bg-gray-700 px-4 py-3 font-semibold text-white hover:bg-gray-600 transition-colors touch-manipulation"
          >
            Cancelar
          </button>
          <button
            onClick={handleReassign}
            disabled={loading || !hasChanges}
            className="flex-1 rounded-lg bg-gradient-to-r from-purple-600 to-purple-700 px-4 py-3 font-semibold text-white hover:from-purple-700 hover:to-purple-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation active:scale-95"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                Reasignando...
              </span>
            ) : (
              '✅ Confirmar Reasignación'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
