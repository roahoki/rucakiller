'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Notification } from '@/lib/types';

interface KillConfirmationModalProps {
  gameId: string;
  playerId: string;
}

interface PendingKill {
  eventId: string;
  killerName: string;
  location: string;
  weapon: string;
}

export default function KillConfirmationModal({ gameId, playerId }: KillConfirmationModalProps) {
  const [pendingKill, setPendingKill] = useState<PendingKill | null>(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    const checkPendingKills = async () => {
      // Buscar eventos de asesinato pendientes donde soy la víctima
      const { data: event } = await supabase
        .from('events')
        .select('id, killer_id, location, weapon')
        .eq('game_id', gameId)
        .eq('victim_id', playerId)
        .eq('event_type', 'kill')
        .eq('confirmed', false)
        .maybeSingle();

      if (event) {
        // Obtener nombre del asesino
        const { data: killer } = await supabase
          .from('players')
          .select('name')
          .eq('id', event.killer_id)
          .single();

        if (killer) {
          setPendingKill({
            eventId: event.id,
            killerName: killer.name,
            location: event.location,
            weapon: event.weapon,
          });
        }
      }
    };

    checkPendingKills();

    // Suscripción a nuevos eventos
    const eventsChannel = supabase
      .channel(`pending_kills:${playerId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'events',
          filter: `victim_id=eq.${playerId}`,
        },
        async (payload) => {
          const event = payload.new as any;
          
          if (event.event_type === 'kill' && !event.confirmed) {
            // Obtener nombre del asesino
            const { data: killer } = await supabase
              .from('players')
              .select('name')
              .eq('id', event.killer_id)
              .single();

            if (killer) {
              setPendingKill({
                eventId: event.id,
                killerName: killer.name,
                location: event.location,
                weapon: event.weapon,
              });
            }
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'events',
        },
        (payload) => {
          const event = payload.old as any;
          if (event.id === pendingKill?.eventId) {
            setPendingKill(null);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'events',
        },
        (payload) => {
          const event = payload.new as any;
          if (event.id === pendingKill?.eventId && event.confirmed) {
            setPendingKill(null);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(eventsChannel);
    };
  }, [gameId, playerId, pendingKill?.eventId]);

  const handleConfirmation = async (confirmed: boolean) => {
    if (!pendingKill) return;

    setProcessing(true);

    try {
      const response = await fetch('/api/kill/confirm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventId: pendingKill.eventId,
          victimId: playerId,
          confirmed,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || 'Error al procesar la respuesta');
      } else {
        setPendingKill(null);
      }
    } catch (error) {
      console.error('Error confirming kill:', error);
      alert('Error al procesar la respuesta');
    } finally {
      setProcessing(false);
    }
  };

  if (!pendingKill) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl bg-gradient-to-br from-red-900 via-red-950 to-black p-6 shadow-2xl border-2 border-red-500/50">
        <div className="mb-6 text-center">
          <div className="mb-4 text-6xl">⚔️</div>
          <h2 className="text-2xl font-bold text-white mb-2">
            ¡Te han intentado asesinar!
          </h2>
          <p className="text-red-200">
            <strong>{pendingKill.killerName}</strong> dice que te asesinó
          </p>
        </div>

        <div className="mb-6 space-y-3 rounded-lg bg-black/40 p-4 backdrop-blur-sm">
          <div>
            <p className="text-sm text-red-300">📍 Lugar</p>
            <p className="text-lg font-semibold text-white">{pendingKill.location}</p>
          </div>
          <div>
            <p className="text-sm text-red-300">🔪 Arma</p>
            <p className="text-lg font-semibold text-white">{pendingKill.weapon}</p>
          </div>
        </div>

        <div className="mb-4 rounded-lg bg-yellow-600/20 p-3 backdrop-blur-sm border border-yellow-500/30">
          <p className="text-sm text-yellow-100 text-center">
            ¿Las condiciones fueron correctas?
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => handleConfirmation(false)}
            disabled={processing}
            className="flex-1 rounded-xl bg-gradient-to-r from-gray-600 to-gray-700 p-4 font-bold text-white shadow-lg transition-all hover:from-gray-700 hover:to-gray-800 hover:shadow-xl active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {processing ? '...' : '❌ Rechazar'}
          </button>
          <button
            onClick={() => handleConfirmation(true)}
            disabled={processing}
            className="flex-1 rounded-xl bg-gradient-to-r from-green-600 to-green-700 p-4 font-bold text-white shadow-lg transition-all hover:from-green-700 hover:to-green-800 hover:shadow-xl active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {processing ? '...' : '✅ Confirmar'}
          </button>
        </div>

        <p className="mt-4 text-center text-xs text-red-300/70">
          Si rechazas, el intento se cancelará
        </p>
      </div>
    </div>
  );
}
