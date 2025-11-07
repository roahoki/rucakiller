'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { testSupabaseConnection } from '@/lib/test-connection';

export default function Home() {
  const router = useRouter();
  const [connectionStatus, setConnectionStatus] = useState<'testing' | 'connected' | 'error'>('testing');

  useEffect(() => {
    const checkConnection = async () => {
      const isConnected = await testSupabaseConnection();
      setConnectionStatus(isConnected ? 'connected' : 'error');
    };
    checkConnection();
  }, []);

  const handleCreateGame = () => {
    router.push('/create');
  };

  const handleJoinGame = () => {
    router.push('/join');
  };

  const handleGameMasterLogin = () => {
    router.push('/gamemaster/login');
  };

  return (
    <div className="h-screen w-full overflow-hidden bg-gradient-to-br from-red-900 via-red-950 to-black p-4 font-sans">
      <div className="flex h-full w-full items-center justify-center">
        <div className="w-full max-w-md text-center">
          {/* Logo/Title */}
          <h1 className="mb-2 text-7xl font-bold tracking-tight text-white drop-shadow-lg">
            RUCAKILLER
          </h1>
          <p className="mb-12 text-xl text-red-200">Juego de asesinatos secretos en rucakaru</p>
          
          {/* Main Action Buttons */}
          <div className="mb-8 space-y-4">
            <button
              onClick={handleCreateGame}
              className="w-full rounded-lg bg-red-600 px-8 py-4 text-lg font-semibold text-white shadow-lg transition-all hover:bg-red-700 hover:scale-105 active:scale-95"
            >
              🎮 Crear Partida
            </button>
            
            <button
              onClick={handleJoinGame}
              className="w-full rounded-lg border-2 border-red-600 bg-transparent px-8 py-4 text-lg font-semibold text-red-100 shadow-lg transition-all hover:bg-red-600/20 hover:scale-105 active:scale-95"
            >
              🔪 Unirse a Partida
            </button>

            <button
              onClick={handleGameMasterLogin}
              className="w-full rounded-lg border-2 border-yellow-600 bg-transparent px-8 py-4 text-lg font-semibold text-yellow-100 shadow-lg transition-all hover:bg-yellow-600/20 hover:scale-105 active:scale-95"
            >
              👑 Soy GameMaster
            </button>
          </div>

          {/* Connection Status Indicator */}
          <div className="rounded-lg bg-black/30 p-4 backdrop-blur-sm">
            <p className="mb-1 text-xs text-gray-400">Estado del servidor:</p>
            {connectionStatus === 'testing' && (
              <p className="text-sm text-yellow-400">⏳ Conectando...</p>
            )}
            {connectionStatus === 'connected' && (
              <p className="text-sm text-green-400">✅ Servidor online</p>
            )}
            {connectionStatus === 'error' && (
              <p className="text-sm text-red-400">❌ Error de conexión</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
