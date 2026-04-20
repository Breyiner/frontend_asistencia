// React: hooks principales para estado, efectos y memoización de callbacks
import { useEffect, useState, useCallback } from "react";

// Cliente HTTP centralizado del proyecto
import { api } from "../services/apiClient";

// Utilidad interna de validación en frontend
import { validarCamposReact } from "../utils/validators";

// Alertas UX (éxito, error, confirmaciones)
import { success, error, confirm } from "../utils/alertas";

// Navegación programática
import { useNavigate } from "react-router-dom";

/**
 * Schema para **edición** de fichas (igual que creación + status_id).
 *
 * - Define validaciones requeridas por UI antes de enviar PATCH.
 * - Se usa en save() para bloquear envíos inválidos.
 *
 * @type {Array<{name: string, type: string, required?: boolean, maxLength?: number}>}
 */
const fichaSchema = [
  // Número de ficha: texto (solo dígitos se controla en InputField), requerido
  { name: "ficha_number", type: "text", required: true, maxLength: 20 },
  // Programa: select requerido
  { name: "training_program_id", type: "select", required: true },
  // Gestor: select requerido (tu UI lo condiciona por rol)
  { name: "gestor_id", type: "select", required: true },
  // Jornada: select requerido
  { name: "shift_id", type: "select", required: true },
  // Fechas: requeridas
  { name: "start_date", type: "date", required: true },
  { name: "end_date", type: "date", required: true },
  // Estado: requerido en edición
  { name: "status_id", type: "select", required: true },
];

/**
 * Mapea datos de ficha → formulario editable.
 *
 * - Convierte IDs numéricos → strings para <select>.
 * - Convierte null/undefined → "" para inputs controlados.
 *
 * @param {Object|null} ficha Datos crudos de la API (o null).
 * @returns {Object} Formato listo para inputs controlados.
 */
function mapFichaToForm(ficha) {
  return {
    // Campo texto: fallback a string vacía
    ficha_number: ficha?.ficha_number || "",
    // Selects: siempre string
    training_program_id: ficha?.training_program_id ? String(ficha.training_program_id) : "",
    gestor_id: ficha?.gestor_id ? String(ficha.gestor_id) : "",
    shift_id: ficha?.shift_id ? String(ficha.shift_id) : "",
    // Fechas: se quedan como string Y-m-d
    start_date: ficha?.start_date || "",
    end_date: ficha?.end_date || "",
    // Estado: string
    status_id: ficha?.status_id ? String(ficha.status_id) : "",
  };
}

/**
 * Hook completo para ver/editar/eliminar una ficha específica.
 *
 * Incluye acciones de trimestres (set current / delete) y un flag dedicado
 * `termsBusy` para **bloquear la sección de cards** mientras se ejecutan.
 *
 * @param {string|number} id ID de la ficha (desde params).
 * @returns {{
 *  ficha: any,
 *  loading: boolean,
 *  isEditing: boolean,
 *  form: any,
 *  errors: Record<string,string>,
 *  saving: boolean,
 *  termsBusy: boolean,
 *  startEdit: Function,
 *  cancelEdit: Function,
 *  onChange: Function,
 *  save: Function,
 *  deleteFicha: Function,
 *  refetch: Function,
 *  setCurrentTerm: Function,
 *  deleteFichaTerm: Function,
 * }}
 */
export default function useFichaShow(id) {
  // Router navigate para redirecciones tras delete
  const navigate = useNavigate();

  // Estado: ficha (data) y loading inicial
  const [ficha, setFicha] = useState(null);
  const [loading, setLoading] = useState(false);

  // Estado: modo edición vs lectura
  const [isEditing, setIsEditing] = useState(false);

  // Estado: formulario editable (controlado)
  const [form, setForm] = useState(mapFichaToForm(null));
  // Estado: errores de validación por campo
  const [errors, setErrors] = useState({});
  // Estado: “busy” general (guardar/eliminar ficha, etc.)
  const [saving, setSaving] = useState(false);

  /**
   * Estado NUEVO: “busy” específico para acciones de trimestres.
   *
   * Objetivo: al marcar trimestre como actual (o borrarlo),
   * se deshabilitan los botones y **toda la card/sección**.
   */
  const [termsBusy, setTermsBusy] = useState(false);

  /**
   * Carga ficha desde API.
   *
   * - Evita llamadas si no hay id.
   * - Maneja loading inicial del show.
   *
   * @returns {Promise<void>}
   */
  const fetchFicha = useCallback(async () => {
    // Guard clause: sin id no hay fetch
    if (!id) return;

    // Activa spinner
    setLoading(true);

    try {
      // Request: GET fichas/{id}
      const res = await api.get(`fichas/${id}`);

      // Si ok: set data, sino null (ficha no encontrada o error)
      setFicha(res.ok ? res.data : null);
    } finally {
      // Desactiva spinner aunque haya error
      setLoading(false);
    }
  }, [id]);

  /**
   * Efecto: carga automática al montar o cambiar id.
   */
  useEffect(() => {
    // Ejecuta fetch memorizado
    fetchFicha();
  }, [fetchFicha]);

  /**
   * Efecto: sincroniza el formulario con la ficha cargada.
   *
   * Nota: tu comentario decía “En modo edición mantiene cambios del usuario”,
   * pero tu implementación actual siempre resetea form cuando cambia ficha
   * (y eso está bien porque fetchFicha() se dispara después de guardar).
   */
  useEffect(() => {
    // Si no hay ficha, no hay nada que mapear
    if (!ficha) return;

    // Ajusta el estado del form al modelo recién cargado
    setForm(mapFichaToForm(ficha));
  }, [ficha, isEditing]);

  /**
   * Activa modo edición.
   *
   * - Limpia errores previos para UX limpia.
   */
  const startEdit = useCallback(() => {
    // Cambia a edición
    setIsEditing(true);
    // Limpia errores
    setErrors({});
  }, []);

  /**
   * Cancela edición:
   * - vuelve a modo lectura,
   * - limpia errores,
   * - restaura el formulario al estado original de ficha.
   */
  const cancelEdit = useCallback(() => {
    // Sale de edición
    setIsEditing(false);
    // Limpia errores
    setErrors({});
    // Restaura form a valores actuales del modelo
    setForm(mapFichaToForm(ficha));
  }, [ficha]);

  /**
   * Handler genérico de inputs controlados.
   *
   * - Actualiza el campo por name.
   * - Limpia el error de ese campo si existía.
   *
   * @param {React.ChangeEvent<HTMLInputElement|HTMLSelectElement|HTMLTextAreaElement>} e
   */
  const onChange = useCallback(
    (e) => {
      // Extrae name/value del target
      const { name, value } = e.target;

      // Actualiza form de forma inmutable
      setForm((prev) => ({ ...prev, [name]: value }));

      // Limpia error de ese campo si existe
      if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
    },
    [errors],
  );

  /**
   * Guarda cambios de ficha (PATCH).
   *
   * Flujo:
   * 1) Valida schema
   * 2) Construye payload tipado
   * 3) PATCH API
   * 4) Alert + recarga + salir de edición
   *
   * @returns {Promise<boolean>}
   */
  const save = useCallback(async () => {
    // Validación previa al request
    const result = validarCamposReact(form, fichaSchema);

    // Si inválido: set errores y aborta
    if (!result.ok) {
      setErrors(result.errors || {});
      return false;
    }

    try {
      // Busy ON
      setSaving(true);

      // Construye payload para backend (IDs como number)
      const payload = {
        // Trim por consistencia
        ficha_number: form.ficha_number?.trim(),
        // Convierte string -> number o null
        training_program_id: form.training_program_id ? Number(form.training_program_id) : null,
        gestor_id: form.gestor_id ? Number(form.gestor_id) : null,
        shift_id: form.shift_id ? Number(form.shift_id) : null,
        // Strings o null
        start_date: form.start_date || null,
        end_date: form.end_date || null,
        // Estado como number
        status_id: form.status_id ? Number(form.status_id) : null,
      };

      // Request PATCH
      const res = await api.patch(`fichas/${id}`, payload);

      // Si falla: alerta y aborta
      if (!res.ok) {
        await error(res.message || "No se pudo actualizar la ficha.");
        return false;
      }

      // Éxito: feedback
      await success(res.message || "Ficha actualizada con éxito.");

      // Sale de edición
      setIsEditing(false);

      // Recarga ficha fresca
      await fetchFicha();

      // OK
      return true;
    } catch (e) {
      // Error de red u otro
      await error(e?.message || "Error de conexión.");
      return false;
    } finally {
      // Busy OFF
      setSaving(false);
    }
  }, [form, id, fetchFicha]);

  /**
   * Elimina la ficha (DELETE).
   *
   * Flujo:
   * 1) confirm
   * 2) delete
   * 3) feedback
   * 4) navigate
   *
   * @returns {Promise<boolean>}
   */
  const deleteFicha = useCallback(async () => {
    // Confirmación del usuario
    const confirmed = await confirm("¿Eliminar esta ficha? Esta acción no se puede deshacer.");

    // Si cancela: no hace nada
    if (!confirmed) return false;

    try {
      // Busy ON
      setSaving(true);

      // DELETE request
      const res = await api.delete(`fichas/${id}`);

      // Si falla: feedback
      if (!res.ok) {
        await error(res.message || "No se pudo eliminar la ficha.");
        return false;
      }

      // Éxito: feedback
      await success(res.message || "Ficha eliminada con éxito.");

      // Redirección
      navigate("/fichas");

      return true;
    } catch (e) {
      await error(e?.message || "Error de conexión.");
      return false;
    } finally {
      // Busy OFF
      setSaving(false);
    }
  }, [id, navigate]);

  /**
   * Marca un trimestre como actual (PATCH ficha_terms/{id}/set_current).
   *
   * Requisito UX:
   * - mientras corre, se deshabilitan los botones globales
   *   y la sección de cards (usando termsBusy).
   *
   * @param {number|string} fichaTermId ID del ficha_term.
   * @returns {Promise<boolean>}
   */
  const setCurrentTerm = useCallback(
    async (fichaTermId) => {
      try {
        // Bloqueo específico de trimestres
        setTermsBusy(true);

        // (Opcional) Bloqueo global de botones
        setSaving(true);

        // Request al backend
        const res = await api.patch(`ficha_terms/${fichaTermId}/set_current`);

        // Manejo de error de API
        if (!res.ok) {
          await error(res.message || "No se pudo establecer como actual.");
          return false;
        }

        // Éxito
        await success(res.message || "Trimestre marcado como actual.");

        // Recarga ficha para refrescar currentId / lista
        await fetchFicha();

        return true;
      } catch (e) {
        await error(e?.message || "Error de conexión.");
        return false;
      } finally {
        // Libera bloqueos siempre
        setSaving(false);
        setTermsBusy(false);
      }
    },
    [fetchFicha],
  );

  /**
   * Elimina un trimestre asociado (DELETE ficha_terms/{id}).
   *
   * - Bloquea sección de cards durante ejecución (termsBusy).
   *
   * @param {number|string} fichaTermId ID del ficha_term.
   * @returns {Promise<boolean>}
   */
  const deleteFichaTerm = useCallback(
    async (fichaTermId) => {
      // Confirmación (tu confirm retorna {isConfirmed} en este método)
      const confirmed = await confirm("¿Eliminar este trimestre asociado?");

      // Si no confirma: aborta
      if (!confirmed?.isConfirmed) return false;

      try {
        // Bloqueo específico de trimestres
        setTermsBusy(true);

        // (Opcional) Bloqueo global
        setSaving(true);

        // Request
        const res = await api.delete(`ficha_terms/${fichaTermId}`);

        // Error API
        if (!res.ok) {
          await error(res.message || "No se pudo eliminar.");
          return false;
        }

        // Éxito
        await success(res.message || "Trimestre eliminado.");

        // Recarga
        await fetchFicha();

        return true;
      } catch (e) {
        await error(e?.message || "Error de conexión.");
        return false;
      } finally {
        // Libera bloqueos
        setSaving(false);
        setTermsBusy(false);
      }
    },
    [fetchFicha],
  );

  // API pública del hook
  return {
    ficha,
    loading,
    isEditing,
    form,
    errors,
    saving,

    // Exponemos bloqueo específico para cards
    termsBusy,

    startEdit,
    cancelEdit,
    onChange,
    save,
    deleteFicha,

    // Re-fetch manual
    refetch: fetchFicha,

    // Acciones de trimestres
    setCurrentTerm,
    deleteFichaTerm,
  };
}
