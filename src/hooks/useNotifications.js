/**
 * useNotifications - Hook para sistema de notificaciones real-time.
 * Maneja WebSocket (Laravel Reverb) + polling HTTP + audio feedback.
 */
import { useState, useEffect, useRef, useCallback } from "react";
import { api } from "../services/apiClient";                    // HTTP endpoints
import { echo } from "../lib/echo";                            // Laravel Reverb client

export function useNotifications(userId, actingRoleCode) {     // userId para channel privado, actingRoleCode para filtro
  const [unreadCount, setUnreadCount] = useState(0);           // Badge contador notificaciones no leídas
  const [latest, setLatest] = useState([]);                    // Array últimas 10 notificaciones
  const [loading, setLoading] = useState(true);                // Loading inicial fetch count+latest
  const [loadingOnOpen, setLoadingOnOpen] = useState(false);   // Loading específico popover/abrir
  const audioRef = useRef(null);                               // Ref para elemento <audio> (no re-render)

  // Guarda rol activo en ref para NO re-suscribir WebSocket si cambia
  const actingRoleRef = useRef(actingRoleCode);                
  useEffect(() => {                                            // Sync ref con prop
    actingRoleRef.current = actingRoleCode;                    
  }, [actingRoleCode]);

  // Crea elemento audio una vez (persistente entre re-renders)
  useEffect(() => {                                            
    const audio = new Audio("sounds/sound-notification.mp3");  // Ruta relativa pública
    audio.preload = "auto";                                    // Pre-carga para 0 latencia
    audioRef.current = audio;                                 // Asigna a ref
    return () => {                                             // Cleanup desmontar
      audioRef.current = null;                                 
    };
  }, []);                                                      // [] = una vez al montar

  // Reproduce sonido notification (con manejo autoplay policy)
  const playSound = useCallback(() => {                        
    const audio = audioRef.current;                           
    if (!audio) return;                                        // Audio no listo
    const playPromise = audio.play();                          // Moderno: retorna Promise
    if (playPromise !== undefined) {                           // Algunos browsers bloquean autoplay
      playPromise.catch(e => {                                
        console.error("Error al reproducir sonido:", e);      // Silencioso, no rompe flujo
      });
    }
  }, []);                                                      // Memoizado, NO depende audioRef

  // Inicializa count+latest solo UNA vez por userId (no re-fetch si cambia)
  useEffect(() => {                                            
    if (!userId) return;                                       // Sin usuario → no fetch
    const fetchInitial = async () => {                         
      try {
        // Parallel fetch para menor latencia
        const [countRes, latestRes] = await Promise.all([      
          api.get("notifications/unread-count"),                // GET /api/notifications/unread-count
          api.get("notifications/latest?limit=10")               // GET /api/notifications/latest?limit=10
        ]);
        // Maneja diferentes estructuras backend response
        setUnreadCount(countRes.data?.data?.count ?? countRes.data?.count ?? 0);
        setLatest(latestRes.data?.data ?? latestRes.data ?? []); 
      } catch (e) {
        console.error("Error fetchInitial notifications:", e); // Silencioso (no toast)
      } finally {
        setLoading(false);                                     // Fin loading inicial
      }
    };
    fetchInitial();                                            // Ejecuta async
  }, [userId]);                                                // Dependencia: recarga si cambia usuario

  // WebSocket: suscripción privada users.{userId} (NO por role)
  useEffect(() => {                                            
    if (!userId) return;                                       // Sin usuario → no channel
    const channel = echo.private(`users.${userId}`);           // Laravel: private-users.{userId}
    
    const handler = (payload) => {                             // Event notification.created
          
      const currentRole = actingRoleRef.current;               // Rol actual desde ref (no causa re-run)
      // Filtra notificaciones por rol destino (prof no ve admin alerts)
      if (currentRole !== payload?.role_code && currentRole !== payload.role_code) return;
      
      setUnreadCount(c => c + 1);                              // +1 inmediato (optimista)
      setLatest(prev => [payload, ...prev.slice(0, 10)]);      // Prepend + truncate 10
      playSound();                                             // Audio feedback
    };
    
    channel.listen("notification.created", handler);           // Laravel event → JS callback
    return () => {                                             // Cleanup desmontar
      channel.stopListening("notification.created", handler);  // Desuscribe event específico
      // NO echo.leave() → mantiene channel abierto (evita perder eventos)
    };
  }, [userId, playSound]);                                     // Dependencias estables

  // Carga latest al abrir popover (refresh manual)
  const loadLatest = async () => {                             
    if (!userId) return;                                      
    setLoadingOnOpen(true);                                    // Spinner popover
    try {
      const res = await api.get("notifications/latest?limit=10");
      setLatest(res.data?.data ?? res.data ?? []);             // Refresh lista
    } catch (error) {
      console.error("Error fetching latest notifications:", error);
    } finally {
      setLoadingOnOpen(false);                                 // Fin spinner
    }
  };

  // Marca UNA notificación como leída (click item)
  const markAsRead = async (notificationId) => {               
    if (!userId || !notificationId) return;                    // Safety checks
    const current = latest.find(n => n.id === notificationId); 
    const wasUnread = current ? !current.read_at : true;       // Optimista count--
    
    try {
      await api.patch(`notifications/${notificationId}/read`); // PATCH /api/notifications/123/read
      // UI inmediata (NO await response para 0 latencia)
      const nowIso = new Date().toISOString();                 
      setLatest(prev => prev.map(n => 
        n.id === notificationId 
          ? { ...n, read_at: n.read_at ?? nowIso }             // Marca leída optimista
          : n
      ));
      if (wasUnread) setUnreadCount(c => Math.max(0, c - 1));  // -- si era unread
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  // Marca TODAS como leídas (botón "Marcar todo leído")
  const markAllAsRead = async () => {                          
    if (!userId) return;                                      
    try {
      await api.patch("notifications/read-all");               // PATCH /api/notifications/read-all
      const nowIso = new Date().toISOString();                 
      setLatest(prev => prev.map(n => ({                      
        ...n, read_at: n.read_at ?? nowIso                     // Optimista todas leídas
      })));
      setUnreadCount(0);                                       // Reset badge
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  // Exporta API pública del hook
  return {
    unreadCount,      // Badge número
    latest,           // Array notificaciones
    loading,          // Inicial
    loadingOnOpen,    // Popover
    loadLatest,       // Refresh manual
    markAsRead,       // Click item
    markAllAsRead     // Botón bulk
  };
}
