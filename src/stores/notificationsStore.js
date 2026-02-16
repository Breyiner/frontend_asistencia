// Importa Zustand para crear store de estado global
import { create } from "zustand";

// Importa instancia de Laravel Echo para WebSockets
import echo from "../lib/echo";

// Importa cliente de API
import { api } from "../services/apiClient";

/**
 * Límite de notificaciones para el popover "latest".
 * Solo muestra las 10 más recientes.
 * 
 * @constant
 */
const LIMIT_LATEST = 10;

/**
 * Extrae el contador de una respuesta del backend.
 * Normaliza diferentes estructuras de respuesta.
 * 
 * @function
 * @param {Object} res - Respuesta del API
 * @returns {number} Contador de notificaciones
 */
const getCountFromRes = (res) => res?.data?.data?.count ?? res?.data?.count ?? 0;

/**
 * Extrae lista de notificaciones de una respuesta del backend.
 * Normaliza diferentes estructuras de respuesta.
 * 
 * @function
 * @param {Object} res - Respuesta del API
 * @returns {Array} Lista de notificaciones
 */
const getListFromRes = (res) => res?.data?.data ?? res?.data ?? [];

/**
 * Store de Zustand para gestión de notificaciones en tiempo real.
 * 
 * Características:
 * - Estado global de notificaciones (contador, listas)
 * - Sincronización con backend via HTTP
 * - Actualizaciones en tiempo real via WebSocket (Laravel Echo)
 * - Paginación de notificaciones
 * - Filtrado por estado (todas, leídas, no leídas)
 * - Actualizaciones optimistas (UI instantánea)
 * - Reproducción de sonido para nuevas notificaciones
 * - Soporte multi-rol (filtra por rol activo)
 * 
 * Flujo de uso:
 * 1. bootstrap({ userId, actingRoleCode }) al iniciar sesión
 * 2. Carga contador y últimas notificaciones
 * 3. Se suscribe a canal WebSocket del usuario
 * 4. Recibe notificaciones en tiempo real
 * 5. Reproduce sonido y actualiza UI
 * 
 * @store
 * @example
 * // En componente
 * const unreadCount = useNotificationsStore(s => s.unreadCount);
 * const markAsRead = useNotificationsStore(s => s.markAsRead);
 * 
 * // Bootstrap en app
 * useEffect(() => {
 *   useNotificationsStore.getState().bootstrap({
 *     userId: user.id,
 *     actingRoleCode: 'instructor'
 *   });
 * }, [user]);
 */
export const useNotificationsStore = create((set, get) => ({
  
  /**
   * ESTADO: Información de sesión.
   * Usados para filtrar notificaciones por rol.
   */
  
  // ID del usuario actual
  userId: null,
  
  // Código del rol activo (ej: "instructor", "coordinador")
  actingRoleCode: null,

  /**
   * ESTADO: Datos de notificaciones.
   */
  
  // Contador de notificaciones no leídas
  unreadCount: 0,
  
  // Últimas notificaciones para el popover (máximo LIMIT_LATEST)
  latest: [],
  
  // Notificaciones de la página actual (para vista completa)
  items: [],

  /**
   * ESTADO: Flags de UI.
   */
  
  // true mientras carga latest
  loadingLatest: false,
  
  // true mientras carga items (paginados)
  loadingItems: false,

  /**
   * ESTADO: Paginación y filtros.
   */
  
  // Filtro activo: "all" | "read" | "unread"
  status: "all",
  
  // Página actual
  page: 1,
  
  // Registros por página
  perPage: 10,
  
  // Última página disponible
  lastPage: 1,
  
  // Total de registros
  total: 0,

  /**
   * ESTADO INTERNO: Guards y recursos.
   * Propiedades que no deben ser accedidas directamente por componentes.
   */
  
  // Instancia de Audio para sonido de notificaciones
  _audio: null,
  
  // ID del usuario al que estamos suscritos via WebSocket
  _subscribedUserId: null,
  
  // Clave de bootstrap para evitar re-inicializaciones
  _bootstrappedKey: null,
  
  // true si ya estamos escuchando eventos WebSocket
  _listening: false,

  /**
   * HELPERS OPTIMISTAS.
   * Actualizan UI inmediatamente sin esperar al backend.
   */
  
  /**
   * Cambia el filtro de estado localmente.
   * Resetea la página a 1.
   * 
   * @param {string} status - Nuevo estado ("all" | "read" | "unread")
   */
  setStatusLocal: (status) => set({ status, page: 1 }),

  /**
   * Cambia la página localmente.
   * 
   * @param {number} page - Número de página
   */
  setPageLocal: (page) => set({ page }),

  /**
   * AUDIO: Inicialización y reproducción.
   */
  
  /**
   * Inicializa la instancia de Audio.
   * Solo se ejecuta una vez (guarded por _audio).
   * 
   * Precarga el audio para que esté listo cuando llegue
   * una notificación.
   */
  initAudio: () => {
    // Si ya está inicializado, no hace nada
    if (get()._audio) return;
    
    // Crea instancia de Audio
    const audio = new Audio("/sounds/sound_notification.mp3");
    
    // Precarga el archivo
    audio.preload = "auto";
    
    // Guarda en el store
    set({ _audio: audio });
  },

  /**
   * Reproduce el sonido de notificación.
   * 
   * Maneja errores silenciosamente (puede fallar si el usuario
   * no ha interactuado con la página).
   */
  playSound: () => {
    const audio = get()._audio;
    if (!audio) return;
    
    // play() retorna Promise
    const p = audio.play();
    
    // Si retorna Promise, captura errores silenciosamente
    if (p !== undefined) p.catch(() => {});
  },

  /**
   * BOOTSTRAP: Inicialización del sistema de notificaciones.
   */
  
  /**
   * Inicializa el sistema de notificaciones para un usuario.
   * 
   * Proceso:
   * 1. Verifica que no se haya ejecutado ya para este usuario/rol
   * 2. Guarda userId y actingRoleCode
   * 3. Inicializa audio
   * 4. Se suscribe al canal WebSocket del usuario
   * 5. Carga contador de no leídas y últimas notificaciones
   * 
   * @async
   * @param {Object} params - Parámetros de bootstrap
   * @param {number} params.userId - ID del usuario
   * @param {string} [params.actingRoleCode] - Código del rol activo
   */
  bootstrap: async ({ userId, actingRoleCode }) => {
    // Requiere userId
    if (!userId) return;

    // Crea clave única para este usuario/rol
    const key = `${userId}:${actingRoleCode ?? ""}`;
    
    // Si ya se ejecutó bootstrap para este usuario/rol, no hace nada
    if (get()._bootstrappedKey === key) return;

    // Guarda estado de sesión y marca como bootstrapped
    set({ userId, actingRoleCode, _bootstrappedKey: key });

    // Inicializa audio
    get().initAudio();
    
    // Se suscribe al WebSocket
    get().ensureSubscribed();

    // Carga datos iniciales en paralelo
    await Promise.all([get().fetchUnreadCount(), get().fetchLatest()]);
  },

  /**
   * Actualiza el rol activo.
   * Usado cuando el usuario cambia de rol.
   * 
   * @param {string} actingRoleCode - Nuevo código de rol
   */
  setRole: (actingRoleCode) => set({ actingRoleCode }),

  /**
   * HTTP: Peticiones al backend.
   * No dependen de userId en el cliente (el backend identifica por token).
   */
  
  /**
   * Obtiene el contador de notificaciones no leídas.
   * 
   * @async
   */
  fetchUnreadCount: async () => {
    const res = await api.get("notifications/unread_count");
    set({ unreadCount: getCountFromRes(res) });
  },

  /**
   * Obtiene las últimas LIMIT_LATEST notificaciones.
   * Usado para el popover de la campana.
   * 
   * @async
   */
  fetchLatest: async () => {
    set({ loadingLatest: true });
    
    try {
      const res = await api.get(`notifications/latest?limit=${LIMIT_LATEST}`);
      set({ latest: getListFromRes(res) });
      
    } finally {
      set({ loadingLatest: false });
    }
  },

  /**
   * Obtiene notificaciones paginadas con filtros.
   * Usado para la página completa de notificaciones.
   * 
   * @async
   * @param {Object} [params] - Parámetros opcionales
   * @param {string} [params.status] - Estado a filtrar
   * @param {number} [params.page] - Página a obtener
   */
  fetchItems: async ({ status, page } = {}) => {
    const perPage = get().perPage;

    // Usa parámetros recibidos o valores actuales del store
    const nextStatus = status ?? get().status;
    const nextPage = page ?? get().page;

    set({ loadingItems: true });
    
    try {
      const res = await api.get(
        `notifications/me?status=${nextStatus}&perPage=${perPage}&page=${nextPage}`
      );

      // Extrae datos y paginación de la respuesta
      const data = res?.data ?? [];
      const pg = res?.paginate ?? {};

      // Actualiza estado con datos y metadata de paginación
      set({
        items: data,
        status: nextStatus,
        page: pg.current_page ?? nextPage,
        perPage: pg.per_page ?? perPage,
        total: pg.total ?? data.length,
        lastPage: pg.last_page ?? 1,
      });
      
    } catch (e) {
      // Si falla, deja el estado coherente
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

  /**
   * ACCIONES: Modificar estado de notificaciones.
   */
  
  /**
   * Marca una notificación como leída.
   * 
   * Usa actualización optimista:
   * 1. Actualiza UI inmediatamente
   * 2. Envía petición al backend
   * 3. Si falla, hace rollback recargando datos
   * 
   * @async
   * @param {number} notificationId - ID de la notificación
   */
  markAsRead: async (notificationId) => {
    if (!notificationId) return;

    const { latest, items } = get();

    // Verifica si la notificación está en las listas
    const inLatest = latest.find((n) => n.id === notificationId);
    const inItems = items.find((n) => n.id === notificationId);
    
    // Determina si estaba no leída
    const wasUnread = (inLatest && !inLatest.read_at) || (inItems && !inItems.read_at);

    // OPTIMISTIC UPDATE: actualiza UI inmediatamente
    const nowIso = new Date().toISOString();
    set({
      // Marca como leída en latest (si existe)
      latest: latest.map((n) =>
        n.id === notificationId ? { ...n, read_at: n.read_at ?? nowIso } : n
      ),
      
      // Marca como leída en items (si existe)
      items: items.map((n) =>
        n.id === notificationId ? { ...n, read_at: n.read_at ?? nowIso } : n
      ),
      
      // Decrementa contador si estaba no leída
      unreadCount: wasUnread ? Math.max(0, get().unreadCount - 1) : get().unreadCount,
    });

    try {
      // Confirma en el backend
      await api.patch(`notifications/${notificationId}/read`);
      
    } catch (e) {
      // ROLLBACK: si falla, recarga todo
      await Promise.all([
        get().fetchUnreadCount(),
        get().fetchLatest(),
        get().fetchItems()
      ]);
      throw e;
    }
  },

  /**
   * Marca todas las notificaciones como leídas.
   * 
   * Actualización optimista total.
   * 
   * @async
   */
  markAllAsRead: async () => {
    const { latest, items } = get();
    const nowIso = new Date().toISOString();
    
    // OPTIMISTIC: marca todo como leído
    set({
      unreadCount: 0,
      latest: latest.map((n) => ({ ...n, read_at: n.read_at ?? nowIso })),
      items: items.map((n) => ({ ...n, read_at: n.read_at ?? nowIso })),
    });

    try {
      await api.patch("notifications/read_all");
      
    } catch (e) {
      // ROLLBACK si falla
      await Promise.all([
        get().fetchUnreadCount(),
        get().fetchLatest(),
        get().fetchItems()
      ]);
      throw e;
    }
  },

  /**
   * Elimina una notificación.
   * 
   * No es optimista: espera confirmación del backend.
   * 
   * @async
   * @param {number} notificationId - ID de la notificación
   */
  destroy: async (notificationId) => {
    if (!notificationId) return;

    const { latest, items } = get();
    
    // Elimina en el backend
    await api.delete(`notifications/${notificationId}`);

    // Verifica si estaba en las listas y si era no leída
    const inLatest = latest.find((n) => n.id === notificationId);
    const inItems = items.find((n) => n.id === notificationId);
    const wasUnread = (inLatest && !inLatest.read_at) || (inItems && !inItems.read_at);

    // Actualiza listas y contadores
    set({
      latest: latest.filter((n) => n.id !== notificationId),
      items: items.filter((n) => n.id !== notificationId),
      unreadCount: wasUnread ? Math.max(0, get().unreadCount - 1) : get().unreadCount,
      total: Math.max(0, get().total - 1),
    });
  },

  /**
   * WEBSOCKET: Suscripción y eventos en tiempo real.
   */
  
  /**
   * Asegura la suscripción al canal WebSocket del usuario.
   * 
   * Proceso:
   * 1. Verifica que haya userId
   * 2. Si cambió el userId, se desuscribe del canal anterior
   * 3. Se suscribe al canal del nuevo userId
   * 4. Escucha evento ".notification.created"
   * 5. Al recibir notificación, actualiza estado y reproduce sonido
   * 
   * Guarded: solo se suscribe una vez por userId.
   */
  ensureSubscribed: () => {
    const { userId, _subscribedUserId } = get();
    
    // Requiere userId
    if (!userId) return;

    // Si cambió el userId, limpia suscripción anterior
    if (_subscribedUserId && _subscribedUserId !== userId) {
      echo.leave(`users.${_subscribedUserId}`);
      set({ _listening: false });
    }

    // Actualiza _subscribedUserId si cambió
    if (get()._subscribedUserId !== userId) {
      set({ _subscribedUserId: userId });
    }
    
    // Si ya está escuchando, no hace nada
    if (get()._listening) return;

    // Marca como listening
    set({ _listening: true });

    // Se suscribe al canal privado del usuario
    const channel = echo.private(`users.${userId}`);

    /**
     * Escucha el evento de nueva notificación.
     * 
     * payload: objeto de la notificación desde el backend
     */
    channel.listen(".notification.created", (payload) => {
      const { actingRoleCode, status, latest, items, unreadCount } = get();

      /**
       * Filtro por rol:
       * Si tenemos actingRoleCode y la notificación tiene role_code,
       * solo procesa si coinciden.
       * 
       * Esto evita mostrar notificaciones de otros roles cuando el
       * usuario tiene múltiples roles activos.
       */
      if (actingRoleCode && payload?.role_code && payload.role_code !== actingRoleCode) {
        return;
      }

      // Normaliza la notificación
      const normalized = { ...payload, read_at: payload?.read_at ?? null };

      // Actualiza estado
      set({
        // Incrementa contador de no leídas
        unreadCount: unreadCount + 1,
        
        // Agrega al inicio de latest (máximo LIMIT_LATEST)
        latest: [normalized, ...latest].slice(0, LIMIT_LATEST),
        
        // Agrega a items solo si el filtro no es "read"
        // (si está en filtro "read", no tiene sentido agregar una no leída)
        items: status === "read" ? items : [normalized, ...items],
        
        // Incrementa total
        total: get().total + 1,
      });

      // Reproduce sonido
      get().playSound();
    });
  },
}));