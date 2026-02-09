// hooks/useNotifications.js
import { useState, useEffect, useRef, useCallback } from "react";
import { api } from "../services/apiClient";
import echo from "../lib/echo";

export function useNotifications(userId, actingRoleCode) {
  const [unreadCount, setUnreadCount] = useState(0);
  const [latest, setLatest] = useState([]);
  const [loading, setLoading] = useState(true); // carga inicial
  const [loadingOnOpen, setLoadingOnOpen] = useState(false); // carga al abrir popover

  const audioRef = useRef(null);

  // Guardar rol activo en ref para NO re-suscribir el websocket si cambia
  const actingRoleRef = useRef(actingRoleCode);
  useEffect(() => {
    actingRoleRef.current = actingRoleCode;
  }, [actingRoleCode]);

  // Crea el audio
  useEffect(() => {
    const audio = new Audio("/sounds/sound_notification.mp3"); // o .wav
    audio.preload = "auto";
    audioRef.current = audio;

    return () => {
      audioRef.current = null;
    };
  }, []);

  // Reproducir sonido
  const playSound = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch((e) => {
        console.error("Error al reproducir sonido:", e);
      });
    }
  }, []);

  // Inicializar (count + latest) solo una vez por usuario
  useEffect(() => {
    if (!userId) return;

    const fetchInitial = async () => {
      try {
        const [countRes, latestRes] = await Promise.all([
          api.get("notifications/unread_count"),
          api.get("notifications/latest?limit=10"),
        ]);

        // Ajusta si tu backend responde { data: { count } } en vez de { count }
        setUnreadCount(countRes.data?.data?.count ?? countRes.data?.count ?? 0);

        // Ajusta si tu backend responde { data: [...] } en vez de [...]
        setLatest(latestRes.data?.data ?? latestRes.data ?? []);
      } catch (e) {
        console.error("Error fetchInitial notifications:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchInitial();
  }, [userId]);

  // WebSocket: suscribirse SOLO por userId (no por actingRoleCode)
  useEffect(() => {
    if (!userId) return;

    const channel = echo.private(`users.${userId}`);

    const handler = (payload) => {
      console.log("[WS] notification.created received", payload); // <- clave

      const currentRole = actingRoleRef.current;
      if (
        currentRole &&
        payload?.role_code &&
        payload.role_code !== currentRole
      ) {
        return;
      }

      setUnreadCount((c) => c + 1);

      setLatest((prev) => [payload, ...prev].slice(0, 10));
      playSound();
    };

    channel.listen(".notification.created", handler);

    return () => {
      channel.stopListening(".notification.created", handler);
      // NO hacemos echo.leave aquí para evitar ventanas donde pierdes eventos
    };
  }, [userId, playSound]);

  // Cargar latest al abrir popover (con loader)
  const loadLatest = async () => {
    if (!userId) return;

    setLoadingOnOpen(true);
    try {
      const res = await api.get("notifications/latest?limit=10");
      setLatest(res.data?.data ?? res.data ?? []);
    } catch (error) {
      console.error("Error fetching latest notifications:", error);
    } finally {
      setLoadingOnOpen(false);
    }
  };

  // Marcar una sola como leída (al hacer click)
  const markAsRead = async (notificationId) => {
    if (!userId || !notificationId) return;

    const current = latest.find((n) => n.id === notificationId);
    const wasUnread = current ? !current.read_at : true;

    try {
      await api.patch(`notifications/${notificationId}/read`);

      // UI inmediata
      const nowIso = new Date().toISOString();
      setLatest((prev) =>
        prev.map((n) =>
          n.id === notificationId ? { ...n, read_at: n.read_at ?? nowIso } : n,
        ),
      );

      if (wasUnread) setUnreadCount((c) => (c > 0 ? c - 1 : 0));
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  // (opcional) para vista completa
  const markAllAsRead = async () => {
    if (!userId) return;

    try {
      await api.patch("notifications/read_all");
      setUnreadCount(0);

      const nowIso = new Date().toISOString();
      setLatest((prev) =>
        prev.map((n) => ({ ...n, read_at: n.read_at ?? nowIso })),
      );
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  return {
    unreadCount,
    latest,
    loading,
    loadingOnOpen,
    loadLatest,
    markAsRead,
    markAllAsRead,
  };
}
