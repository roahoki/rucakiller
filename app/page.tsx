'use client';

import { useEffect, useState } from 'react';
import { testSupabaseConnection } from '@/lib/test-connection';

export default function Home() {
  const [connectionStatus, setConnectionStatus] = useState<'testing' | 'connected' | 'error'>('testing');

  useEffect(() => {
    const checkConnection = async () => {
      const isConnected = await testSupabaseConnection();
      setConnectionStatus(isConnected ? 'connected' : 'error');
    };
    checkConnection();
  }, []);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-red-900 to-black font-sans">
      <div className="text-center">
        <h1 className="mb-4 text-6xl font-bold text-white">RUCAKILLER</h1>
        <p className="mb-8 text-xl text-red-200">Juego de asesinatos secretos</p>
        
        {/* Indicador de conexión con Supabase */}
        <div className="rounded-lg bg-black/50 p-6">
          <p className="mb-2 text-sm text-gray-300">Estado de Supabase:</p>
          {connectionStatus === 'testing' && (
            <p className="text-yellow-400">⏳ Probando conexión...</p>
          )}
          {connectionStatus === 'connected' && (
            <p className="text-green-400">✅ Conectado exitosamente</p>
          )}
          {connectionStatus === 'error' && (
            <p className="text-red-400">❌ Error de conexión</p>
          )}
        </div>
      </div>
    </div>
  );
}
