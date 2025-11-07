'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface Notification {
  id: string;
  game_id: string;
  player_id: string | null;
  type: 'public' | 'private';
  message: string;
  read: boolean;
  created_at: string;
}

interface NotificationCenterProps {
  gameId: string;
  playerId: string;
}

export default function NotificationCenter({ gameId, playerId }: NotificationCenterProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      // Obtener notificaciones públicas y privadas del jugador
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('game_id', gameId)
        .or(`player_id.is.null,player_id.eq.${playerId}`)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) {
        console.error('Error fetching notifications:', error);
      } else if (data) {
        setNotifications(data);
        setUnreadCount(data.filter(n => !n.read).length);
      }

      setLoading(false);
    };

    fetchNotifications();

    // Suscripción en tiempo real a nuevas notificaciones
    const channel = supabase
      .channel(`notifications:${gameId}:${playerId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `game_id=eq.${gameId}`,
        },
        async (payload) => {
          const newNotification = payload.new as Notification;
          
          // Solo mostrar si es pública o dirigida a este jugador
          if (!newNotification.player_id || newNotification.player_id === playerId) {
            setNotifications((prev) => [newNotification, ...prev]);
            setUnreadCount((prev) => prev + 1);
            
            // Vibración si el navegador lo soporta
            if ('vibrate' in navigator) {
              navigator.vibrate(200);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [gameId, playerId]);

  const markAllAsRead = async () => {
    const unreadIds = notifications.filter(n => !n.read).map(n => n.id);
    
    if (unreadIds.length === 0) return;

    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .in('id', unreadIds);

    if (error) {
      console.error('Error marking notifications as read:', error);
    } else {
      setNotifications(prev => 
        prev.map(n => ({ ...n, read: true }))
      );
      setUnreadCount(0);
    }
  };

  const toggleOpen = () => {
    setIsOpen(!isOpen);
    
    // Marcar como leídas al abrir
    if (!isOpen && unreadCount > 0) {
      markAllAsRead();
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Ahora';
    if (minutes < 60) return `Hace ${minutes}m`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `Hace ${hours}h`;
    
    return date.toLocaleDateString('es-ES', { 
      day: 'numeric', 
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="relative">
      {/* Notification Bell Button */}
      <button
        onClick={toggleOpen}
        className="relative rounded-full bg-black/40 p-3 backdrop-blur-sm border border-white/10 transition-all hover:bg-black/60 hover:scale-110 active:scale-95"
        aria-label="Notificaciones"
      >
        <span className="text-2xl">🔔</span>
        
        {/* Badge con contador */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <>
          {/* Overlay para cerrar al hacer click afuera */}
          <div 
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Panel de notificaciones */}
          <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 z-50 rounded-xl bg-gray-900 border border-white/20 shadow-2xl backdrop-blur-xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 p-4">
              <h3 className="text-lg font-bold text-white">
                🔔 Notificaciones
              </h3>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Marcar todas como leídas
                </button>
              )}
            </div>

            {/* Lista de notificaciones */}
            <div className="max-h-96 overflow-y-auto">
              {loading ? (
                <div className="p-8 text-center">
                  <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-white/20 border-t-white"></div>
                  <p className="mt-2 text-sm text-gray-400">Cargando...</p>
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-4xl mb-2">📭</p>
                  <p className="text-gray-400">No hay notificaciones</p>
                </div>
              ) : (
                <div className="divide-y divide-white/10">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 transition-colors hover:bg-white/5 ${
                        !notification.read ? 'bg-blue-900/20' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {/* Icono según tipo */}
                        <span className="text-2xl flex-shrink-0">
                          {notification.type === 'public' ? '📢' : '✉️'}
                        </span>
                        
                        <div className="flex-1 min-w-0">
                          {/* Badge de tipo */}
                          <div className="mb-1">
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                              notification.type === 'public' 
                                ? 'bg-purple-600/30 text-purple-200' 
                                : 'bg-blue-600/30 text-blue-200'
                            }`}>
                              {notification.type === 'public' ? 'Pública' : 'Privada'}
                            </span>
                          </div>
                          
                          {/* Mensaje */}
                          <p className={`text-sm leading-relaxed ${
                            !notification.read ? 'text-white font-medium' : 'text-gray-300'
                          }`}>
                            {notification.message}
                          </p>
                          
                          {/* Timestamp */}
                          <p className="mt-1 text-xs text-gray-500">
                            {formatTime(notification.created_at)}
                          </p>
                        </div>
                        
                        {/* Indicador de no leída */}
                        {!notification.read && (
                          <div className="h-2 w-2 rounded-full bg-blue-500 flex-shrink-0 mt-1"></div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="border-t border-white/10 p-3 text-center">
                <p className="text-xs text-gray-500">
                  Mostrando las últimas 20 notificaciones
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
