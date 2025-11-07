'use client';

import { useState, useEffect } from 'react';

interface GameSetupProps {
  gameId: string;
  onConfigComplete: () => void;
}

export default function GameSetup({ gameId, onConfigComplete }: GameSetupProps) {
  const [locations, setLocations] = useState<string[]>(['', '', '', '', '']);
  const [weapons, setWeapons] = useState<string[]>(Array(18).fill(''));
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showWeapons, setShowWeapons] = useState(false);

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
  }, []);

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
