import { create } from "zustand";
import echo from "../lib/echo";
import { api } from "../services/apiClient";

const LIMIT_LATEST = 10;

const getCountFromRes = (res) => res?.data?.data?.count ?? res?.data?.count ?? 0;
const getListFromRes = (res) => res?.data?.data ?? res?.data ?? [];

export const useNotificationsStore = create((set, get) => ({
  // session (opcionales, solo para filtrar websocket por role_code)
  userId: null,
  actingRoleCode: null,

  // shared state
  unreadCount: 0,
  latest: [],
  items: [],

  // UI flags
  loadingLatest: false,
  loadingItems: false,

  // page state
  status: "all", // all | read | unread
  page: 1,
  perPage: 10,
  lastPage: 1,
  total: 0,

  // internals/guards
  _audio: null,
  _subscribedUserId: null,
  _bootstrappedKey: null,
  _listening: false,

  // ------------------ optimistic UI helpers ------------------
  // Cambia el estado de la vista inmediatamente (sin esperar al backend)
  setStatusLocal: (status) => set({ status, page: 1 }),

  setPageLocal: (page) => set({ page }),

  // ------------------ audio ------------------
  initAudio: () => {
    if (get()._audio) return;
    const audio = new Audio("/sounds/sound_notification.mp3");
    audio.preload = "auto";
    set({ _audio: audio });
  },

  playSound: () => {
    const audio = get()._audio;
    if (!audio) return;
    const p = audio.play();
    if (p !== undefined) p.catch(() => {});
  },

  // ------------------ bootstrap ------------------
  bootstrap: async ({ userId, actingRoleCode }) => {
    if (!userId) return;

    const key = `${userId}:${actingRoleCode ?? ""}`;
    if (get()._bootstrappedKey === key) return;

    set({ userId, actingRoleCode, _bootstrappedKey: key });

    get().initAudio();
    get().ensureSubscribed();

    await Promise.all([get().fetchUnreadCount(), get().fetchLatest()]);
  },

  setRole: (actingRoleCode) => set({ actingRoleCode }),

  // ------------------ HTTP (NO dependen de userId) ------------------
  fetchUnreadCount: async () => {
    const res = await api.get("notifications/unread_count");
    set({ unreadCount: getCountFromRes(res) });
  },

  fetchLatest: async () => {
    set({ loadingLatest: true });
    try {
      const res = await api.get(`notifications/latest?limit=${LIMIT_LATEST}`);
      console.log(res);
      
      set({ latest: getListFromRes(res) });
    } finally {
      set({ loadingLatest: false });
    }
  },

  fetchItems: async ({ status, page } = {}) => {
    const perPage = get().perPage;

    const nextStatus = status ?? get().status;
    const nextPage = page ?? get().page;

    set({ loadingItems: true });
    try {
      const res = await api.get(
        `notifications/me?status=${nextStatus}&perPage=${perPage}&page=${nextPage}`
      );

      // OJO: aquí estaba tu bug principal
      const data = res?.data ?? [];
      const pg = res?.paginate ?? {};

      set({
        items: data,
        status: nextStatus,
        page: pg.current_page ?? nextPage,
        perPage: pg.per_page ?? perPage,
        total: pg.total ?? data.length,
        lastPage: pg.last_page ?? 1,
      });
    } catch (e) {
      // si falla, deja el estado coherente
      set({
        items: [],
        total: 0,
        lastPage: 1,
        page: 1,
      });
      throw e;
    } finally {
      set({ loadingItems: false });
    }
  },

  // ------------------ actions ------------------
  markAsRead: async (notificationId) => {
    if (!notificationId) return;

    const { latest, items } = get();

    const inLatest = latest.find((n) => n.id === notificationId);
    const inItems = items.find((n) => n.id === notificationId);
    const wasUnread = (inLatest && !inLatest.read_at) || (inItems && !inItems.read_at);

    // Optimistic read (opcional): cambia UI ya, luego confirma
    const nowIso = new Date().toISOString();
    set({
      latest: latest.map((n) =>
        n.id === notificationId ? { ...n, read_at: n.read_at ?? nowIso } : n
      ),
      items: items.map((n) =>
        n.id === notificationId ? { ...n, read_at: n.read_at ?? nowIso } : n
      ),
      unreadCount: wasUnread ? Math.max(0, get().unreadCount - 1) : get().unreadCount,
    });

    try {
      await api.patch(`notifications/${notificationId}/read`);
    } catch (e) {
      // rollback simple: refresca contadores/listas
      await Promise.all([get().fetchUnreadCount(), get().fetchLatest(), get().fetchItems()]);
      throw e;
    }
  },

  markAllAsRead: async () => {
    // optimistic: marca todo como leído ya
    const { latest, items } = get();
    const nowIso = new Date().toISOString();
    set({
      unreadCount: 0,
      latest: latest.map((n) => ({ ...n, read_at: n.read_at ?? nowIso })),
      items: items.map((n) => ({ ...n, read_at: n.read_at ?? nowIso })),
    });

    try {
      await api.patch("notifications/read_all");
    } catch (e) {
      await Promise.all([get().fetchUnreadCount(), get().fetchLatest(), get().fetchItems()]);
      throw e;
    }
  },

  destroy: async (notificationId) => {
    if (!notificationId) return;

    const { latest, items } = get();
    await api.delete(`notifications/${notificationId}`);

    const inLatest = latest.find((n) => n.id === notificationId);
    const inItems = items.find((n) => n.id === notificationId);
    const wasUnread = (inLatest && !inLatest.read_at) || (inItems && !inItems.read_at);

    set({
      latest: latest.filter((n) => n.id !== notificationId),
      items: items.filter((n) => n.id !== notificationId),
      unreadCount: wasUnread ? Math.max(0, get().unreadCount - 1) : get().unreadCount,
      total: Math.max(0, get().total - 1),
    });
  },

  // ------------------ websocket (SI requiere userId) ------------------
  ensureSubscribed: () => {
    const { userId, _subscribedUserId } = get();
    if (!userId) return;

    if (_subscribedUserId && _subscribedUserId !== userId) {
      echo.leave(`users.${_subscribedUserId}`);
      set({ _listening: false });
    }

    if (get()._subscribedUserId !== userId) set({ _subscribedUserId: userId });
    if (get()._listening) return;

    set({ _listening: true });

    const channel = echo.private(`users.${userId}`);

    channel.listen(".notification.created", (payload) => {
      const { actingRoleCode, status, latest, items, unreadCount } = get();

      if (actingRoleCode && payload?.role_code && payload.role_code !== actingRoleCode) return;

      const normalized = { ...payload, read_at: payload?.read_at ?? null };

      set({
        unreadCount: unreadCount + 1,
        latest: [normalized, ...latest].slice(0, LIMIT_LATEST),
        items: status === "read" ? items : [normalized, ...items],
        total: get().total + 1,
      });

      get().playSound();
    });
  },
}));