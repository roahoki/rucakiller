'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import type { Game } from '@/lib/types';

export default function GameMasterDashboard() {
  const params = useParams();
  const gameId = params.id as string;
  const [game, setGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGame = async () => {
      const { data, error } = await supabase
        .from('games')
        .select('*')
        .eq('id', gameId)
        .single();

      if (error) {
        console.error('Error fetching game:', error);
      } else {
        setGame(data);
      }
      setLoading(false);
    };

    fetchGame();
  }, [gameId]);

  if (loading) {
    return (
      <div className="h-screen w-full overflow-hidden bg-gradient-to-br from-red-900 via-red-950 to-black p-4">
        <div className="flex h-full items-center justify-center">
          <p className="text-white">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="h-screen w-full overflow-hidden bg-gradient-to-br from-red-900 via-red-950 to-black p-4">
        <div className="flex h-full items-center justify-center">
          <p className="text-red-200">Partida no encontrada</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full overflow-hidden bg-gradient-to-br from-red-900 via-red-950 to-black p-4">
      <div className="h-full overflow-y-auto">
        <div className="mx-auto max-w-4xl">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="mb-2 text-4xl font-bold text-white">Dashboard GameMaster</h1>
            <div className="inline-block rounded-lg bg-black/50 px-6 py-3">
              <p className="text-sm text-red-200">Código de partida:</p>
              <p className="text-3xl font-bold text-white tracking-wider">{game.code}</p>
            </div>
          </div>

          {/* Status */}
          <div className="mb-6 rounded-lg bg-black/30 p-6 backdrop-blur-sm">
            <p className="mb-1 text-sm text-gray-400">Estado:</p>
            <p className="text-lg font-semibold text-green-400 capitalize">{game.status}</p>
          </div>

          {/* Próximamente */}
          <div className="rounded-lg bg-black/30 p-6 text-center backdrop-blur-sm">
            <p className="text-red-200">
              Próximamente: Configuración del juego, gestión de jugadores y más...
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
