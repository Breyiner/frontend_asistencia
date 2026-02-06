// hooks/useNotifications.js
import { useState, useEffect, useRef, useCallback } from "react";
import { api } from "../services/apiClient";
import echo from "../lib/echo";

export function useNotifications(userId, actingRoleCode) {
  const [unreadCount, setUnreadCount] = useState(0);
  const [latest, setLatest] = useState([]);
  const [loading, setLoading] = useState(true);

  const audioRef = useRef(null);

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
        // Si el navegador lo bloquea (por ejemplo sin gesto de usuario)
        console.error("Error al reproducir sonido:", e);
      });
    }
  }, []);

  // Inicializar (count + latest)
  useEffect(() => {
    if (!userId) return;

    const fetchInitial = async () => {
      try {
        const [countRes, latestRes] = await Promise.all([
          api.get("notifications/unread_count"),
          api.get("notifications/latest?limit=10"),
        ]);

        setUnreadCount(countRes.data?.count ?? 0);
        setLatest(latestRes.data ?? []);
      } finally {
        setLoading(false);
      }
    };

    fetchInitial();
  }, [userId]);

  // WebSocket
  useEffect(() => {
    if (!userId) return;

    const channel = echo.private(`users.${userId}`);

    const handler = (payload) => {
      if (actingRoleCode && payload?.role_code && payload.role_code !== actingRoleCode) {
        return;
      }

      setUnreadCount((c) => c + 1);
      setLatest((prev) => [payload, ...prev].slice(0, 10));
      playSound();
    };

    channel.listen(".notification.created", handler);

    return () => {
      channel.stopListening(".notification.created", handler);
      echo.leave(`users.${userId}`);
    };
  }, [userId, actingRoleCode, playSound]);

  const markAllAsRead = async () => {
    if (!userId) return;
    await api.patch("notifications/read_all");
    setUnreadCount(0);
  };

  return {
    unreadCount,
    latest,
    loading,
    markAllAsRead,
  };
}