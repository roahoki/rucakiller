'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Assignment, Player } from '@/lib/types';

interface AssignmentCardProps {
  gameId: string;
  playerId: string;
}

export default function AssignmentCard({ gameId, playerId }: AssignmentCardProps) {
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [target, setTarget] = useState<Player | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAssignment = async () => {
      // Obtener la asignación activa donde el jugador es el hunter
      const { data: assignmentData, error: assignmentError } = await supabase
        .from('assignments')
        .select('*')
        .eq('game_id', gameId)
        .eq('hunter_id', playerId)
        .eq('is_active', true)
        .single();

      if (assignmentError) {
        console.error('Error fetching assignment:', assignmentError);
        setLoading(false);
        return;
      }

      if (assignmentData) {
        setAssignment(assignmentData);

        // Obtener información del objetivo
        const { data: targetData, error: targetError } = await supabase
          .from('players')
          .select('*')
          .eq('id', assignmentData.target_id)
          .single();

        if (targetError) {
          console.error('Error fetching target:', targetError);
        } else {
          setTarget(targetData);
        }
      }

      setLoading(false);
    };

    fetchAssignment();

    // Suscripción a cambios en tiempo real
    const assignmentChannel = supabase
      .channel(`assignments:${playerId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'assignments',
          filter: `hunter_id=eq.${playerId}`,
        },
        async (payload) => {
          console.log('Assignment changed:', payload);
          
          if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
            const newAssignment = payload.new as Assignment;
            
            if (newAssignment.is_active) {
              setAssignment(newAssignment);

              // Obtener nuevo objetivo
              const { data: newTarget } = await supabase
                .from('players')
                .select('*')
                .eq('id', newAssignment.target_id)
                .single();

              if (newTarget) {
                setTarget(newTarget);
              }
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(assignmentChannel);
    };
  }, [gameId, playerId]);

  if (loading) {
    return (
      <div className="rounded-xl bg-gradient-to-br from-red-800/30 to-red-900/30 p-6 backdrop-blur-sm border border-red-500/30">
        <div className="flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-red-500 border-t-transparent"></div>
          <p className="ml-3 text-white">Cargando tu objetivo...</p>
        </div>
      </div>
    );
  }

  if (!assignment || !target) {
    return (
      <div className="rounded-xl bg-gradient-to-br from-yellow-800/30 to-yellow-900/30 p-6 backdrop-blur-sm border border-yellow-500/30">
        <div className="text-center">
          <p className="text-xl font-semibold text-yellow-200">⚠️ Sin objetivo asignado</p>
          <p className="mt-2 text-sm text-yellow-100/70">
            Espera a que el GameMaster inicie el juego
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-gradient-to-br from-red-800/50 to-red-900/50 p-6 backdrop-blur-sm border-2 border-red-500/50 shadow-2xl">
      {/* Header */}
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold text-white flex items-center justify-center gap-2">
          🎯 Tu Misión
        </h2>
        <div className="mt-2 h-1 w-24 bg-gradient-to-r from-red-500 to-red-600 rounded-full mx-auto"></div>
      </div>

      {/* Target info */}
      <div className="mb-6 rounded-lg bg-black/40 p-5 backdrop-blur-sm">
        <p className="mb-2 text-sm font-medium uppercase tracking-wide text-red-300">
          Objetivo
        </p>
        <p className="text-3xl font-bold text-white">
          {target.name}
        </p>
        {!target.is_alive && (
          <span className="mt-2 inline-block rounded-full bg-gray-700 px-3 py-1 text-xs font-semibold text-gray-300">
            ☠️ Eliminado
          </span>
        )}
      </div>

      {/* Location */}
      <div className="mb-4 rounded-lg bg-black/40 p-5 backdrop-blur-sm">
        <p className="mb-2 text-sm font-medium uppercase tracking-wide text-red-300">
          📍 Lugar
        </p>
        <p className="text-2xl font-bold text-white">
          {assignment.location}
        </p>
      </div>

      {/* Weapon */}
      <div className="rounded-lg bg-black/40 p-5 backdrop-blur-sm">
        <p className="mb-2 text-sm font-medium uppercase tracking-wide text-red-300">
          🔪 Arma
        </p>
        <p className="text-2xl font-bold text-white">
          {assignment.weapon}
        </p>
      </div>

      {/* Instructions */}
      <div className="mt-6 rounded-lg bg-red-950/50 p-4 backdrop-blur-sm border border-red-500/30">
        <p className="text-sm text-red-100/90 leading-relaxed">
          💡 <strong>Cómo asesinar:</strong> Debes estar en <strong>{assignment.location}</strong> con el arma <strong>{assignment.weapon}</strong> y decirle a tu objetivo: <em>"Te maté"</em>
        </p>
      </div>
    </div>
  );
}
