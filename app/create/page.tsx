'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CreateGame() {
  const router = useRouter();
  const [gameMasterName, setGameMasterName] = useState('');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validaciones
    if (!gameMasterName.trim()) {
      setError('Debes ingresar tu nombre');
      setIsLoading(false);
      return;
    }

    if (!/^\d{4,6}$/.test(pin)) {
      setError('El PIN debe tener entre 4 y 6 dígitos');
      setIsLoading(false);
      return;
    }

    if (pin !== confirmPin) {
      setError('Los PINs no coinciden');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/game/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          gameMasterName: gameMasterName.trim(),
          pin: pin,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Error al crear la partida');
        setIsLoading(false);
        return;
      }

            // Guardar en localStorage
      localStorage.setItem('playerId', data.gameMaster.id);
      localStorage.setItem('gameId', data.game.id);
      localStorage.setItem('playerName', data.gameMaster.name);
      localStorage.setItem('isGameMaster', 'true');

      // Redirigir al lobby (misma vista que jugadores, pero con controles GM)
      router.push(`/game/${data.game.id}/lobby`);

    } catch (err) {
      console.error('Error:', err);
      setError('Error inesperado. Intenta nuevamente.');
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen w-full overflow-hidden bg-gradient-to-br from-red-900 via-red-950 to-black p-4">
      <div className="flex h-full w-full items-center justify-center">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="mb-2 text-4xl font-bold text-white">Crear Partida</h1>
            <p className="text-red-200">Configura tu juego como GameMaster</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Nombre */}
            <div>
              <label htmlFor="name" className="mb-2 block text-sm font-medium text-red-100">
                Tu nombre (GameMaster)
              </label>
              <input
                type="text"
                id="name"
                value={gameMasterName}
                onChange={(e) => setGameMasterName(e.target.value)}
                placeholder="Ingresa tu nombre"
                className="w-full rounded-lg border-2 border-red-600 bg-black/50 px-4 py-3 text-white placeholder-gray-400 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/50"
                required
                maxLength={50}
                disabled={isLoading}
              />
            </div>

            {/* PIN */}
            <div>
              <label htmlFor="pin" className="mb-2 block text-sm font-medium text-red-100">
                PIN de seguridad (4-6 dígitos)
              </label>
              <input
                type="password"
                id="pin"
                inputMode="numeric"
                pattern="\d{4,6}"
                maxLength={6}
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                placeholder="1234"
                className="w-full rounded-lg border-2 border-red-600 bg-black/50 px-4 py-3 text-white placeholder-gray-400 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/50"
                required
                disabled={isLoading}
              />
              <p className="mt-1 text-xs text-red-300">
                Este PIN protege tu acceso como GameMaster
              </p>
            </div>

            {/* Confirmar PIN */}
            <div>
              <label htmlFor="confirmPin" className="mb-2 block text-sm font-medium text-red-100">
                Confirmar PIN
              </label>
              <input
                type="password"
                id="confirmPin"
                inputMode="numeric"
                pattern="\d{4,6}"
                maxLength={6}
                value={confirmPin}
                onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                placeholder="1234"
                className="w-full rounded-lg border-2 border-red-600 bg-black/50 px-4 py-3 text-white placeholder-gray-400 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/50"
                required
                disabled={isLoading}
              />
            </div>

            {/* Error message */}
            {error && (
              <div className="rounded-lg bg-red-900/50 border border-red-600 p-3 text-sm text-red-200">
                {error}
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={isLoading || !gameMasterName.trim() || !pin || !confirmPin}
              className="w-full rounded-lg bg-red-600 px-6 py-3 font-semibold text-white shadow-lg transition-all hover:bg-red-700 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isLoading ? '⏳ Creando partida...' : '🎮 Crear Partida'}
            </button>

            {/* Back button */}
            <button
              type="button"
              onClick={() => router.push('/')}
              className="w-full rounded-lg border-2 border-red-600 bg-transparent px-6 py-3 font-semibold text-red-100 transition-all hover:bg-red-600/20 hover:scale-105 active:scale-95"
              disabled={isLoading}
            >
              ← Volver
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
