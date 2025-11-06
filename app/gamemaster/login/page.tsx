'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function GameMasterLogin() {
  const router = useRouter();
  const [gameCode, setGameCode] = useState('');
  const [pin, setPin] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validaciones
    if (!gameCode.trim() || gameCode.length !== 6) {
      setError('El código de partida debe tener 6 caracteres');
      return;
    }

    if (!/^\d{4,6}$/.test(pin)) {
      setError('El PIN debe tener entre 4 y 6 dígitos');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/gamemaster/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          gameCode: gameCode.trim().toUpperCase(),
          pin: pin,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Error al iniciar sesión');
        setIsLoading(false);
        return;
      }

      // Guardar información en localStorage
      localStorage.setItem('playerId', data.gameMaster.id);
      localStorage.setItem('playerName', data.gameMaster.name);
      localStorage.setItem('gameId', data.game.id);
      localStorage.setItem('isGameMaster', 'true');

      // Redirigir al lobby (misma vista que jugadores)
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
            <h1 className="mb-2 text-4xl font-bold text-white">Login GameMaster</h1>
            <p className="text-red-200">Ingresa a tu partida existente</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Código de partida */}
            <div>
              <label htmlFor="code" className="mb-2 block text-sm font-medium text-red-100">
                Código de Partida
              </label>
              <input
                type="text"
                id="code"
                value={gameCode}
                onChange={(e) => setGameCode(e.target.value.toUpperCase())}
                placeholder="J4L60V"
                maxLength={6}
                className="w-full rounded-lg border-2 border-red-600 bg-black/50 px-4 py-3 text-center text-2xl font-bold uppercase tracking-widest text-white placeholder-gray-400 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/50"
                required
                disabled={isLoading}
              />
            </div>

            {/* PIN */}
            <div>
              <label htmlFor="pin" className="mb-2 block text-sm font-medium text-red-100">
                PIN de GameMaster
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
            </div>

            {/* Error message */}
            {error && (
              <div className="rounded-lg border border-red-600 bg-red-900/50 p-3 text-sm text-red-200">
                {error}
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={isLoading || !gameCode.trim() || !pin}
              className="w-full rounded-lg bg-red-600 px-6 py-3 font-semibold text-white shadow-lg transition-all hover:scale-105 hover:bg-red-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
            >
              {isLoading ? '⏳ Ingresando...' : '👑 Ingresar como GameMaster'}
            </button>

            {/* Back button */}
            <button
              type="button"
              onClick={() => router.push('/')}
              className="w-full rounded-lg border-2 border-red-600 bg-transparent px-6 py-3 font-semibold text-red-100 transition-all hover:scale-105 hover:bg-red-600/20 active:scale-95"
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
