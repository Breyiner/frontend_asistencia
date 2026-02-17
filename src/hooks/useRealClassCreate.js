// Importaciones necesarias
import { useState } from "react";                        // Hook principal de React para manejar estado local
import { api } from "../services/apiClient";             // Cliente Axios (o similar) preconfigurado con baseURL, interceptores de auth, manejo de errores global, etc.
import { validarCamposReact } from "../utils/validators"; // Validador personalizado que recibe objeto + schema y retorna {ok, errors}
import { success, error } from "../utils/alertas";       // Wrappers de SweetAlert2 (o similar) con estilos y configuraciones predefinidas

/**
 * Hook personalizado para la CREACIÓN de una nueva "clase real" (sesión concreta impartida).
 * 
 * Propósito principal:
 *   - Manejar formulario completo de creación
 *   - Validación cliente-side con reglas dinámicas
 *   - Preparar y enviar payload correctamente tipado a la API
 *   - Mostrar feedback al usuario (cargando, éxito, error)
 * 
 * Entidad "clase real": instancia única con fecha/hora/instructor/aula específica,
 * distinta de la programación semanal (schedule_sessions).
 */
export default function useRealClassCreate() {
  // Estado principal del formulario
  // Todos los valores se guardan como string porque vienen de <input>/<select>
  // Se convierten a Number solo al momento de enviar (payload)
  const [form, setForm] = useState({
    ficha_id: "",               // ID de la ficha/grupo/programa (relacionado con aprendices)
    instructor_id: "",          // ID del instructor asignado a esta sesión concreta
    classroom_id: "",           // ID del aula/ambiente donde se imparte
    time_slot_id: "",           // ID de la franja horaria (mañana, tarde, noche, etc.)
    schedule_session_id: "",    // ID de la sesión programada semanal (del horario base)
    class_type_id: "",          // ID del tipo de clase (normal, reposición, práctica, etc.)
    start_hour: "",             // Hora de inicio (formato "HH:mm")
    end_hour: "",               // Hora de fin (formato "HH:mm")
    observations: "",           // Notas adicionales (opcional)
    original_date: "",          // Solo usado en reposiciones (class_type_id === "3")
  });

  // Objeto de errores por campo (clave = nombre del campo, valor = mensaje)
  // Se limpia campo por campo al escribir
  const [errors, setErrors] = useState({});

  // Bandera de carga global del formulario (muestra spinner/bloquea botón)
  const [loading, setLoading] = useState(false);

  // Esquema base de validación (común a todos los tipos de clase)
  // Se usa con la librería/formulario personalizado validarCamposReact
  const baseSchema = [
    { name: "instructor_id",  type: "select", required: true },           // Obligatorio seleccionar instructor
    { name: "classroom_id",   type: "select", required: true },
    { name: "time_slot_id",   type: "select", required: true },
    { name: "schedule_session_id", type: "select", required: true },
    { name: "class_type_id",  type: "select", required: true },
    { name: "start_hour",     type: "text",   required: true },           // Podría validarse formato HH:mm en validator
    { name: "end_hour",       type: "text",   required: true },
    { name: "observations",   type: "text",   required: false, maxLength: 500 },
  ];

  /**
   * Manejador único para TODOS los cambios en inputs/selects.
   * @param {Event} e - Evento nativo del cambio
   */
  const onChange = (e) => {
    const { name, value } = e.target;   // name = "instructor_id", value = "42" (string)

    // Actualizamos el estado del form de forma funcional (previo + nuevo valor)
    setForm((prev) => {
      const next = { ...prev, [name]: value };   // spread + sobreescritura

      // Lógica de dependencias / limpieza automática de campos relacionados
      if (name === "ficha_id") {
        next.schedule_session_id = "";           // Al cambiar ficha → resetear sesión programada
      }

      // Solo se pide fecha original en tipo de clase "3" (reposición, recuperación, etc.)
      if (name === "class_type_id" && String(value) !== "3") {
        next.original_date = "";                 // Limpieza automática cuando no aplica
      }

      return next;
    });

    // Limpieza reactiva: al escribir en un campo con error → quitamos ese error
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  /**
   * Función principal: valida TODO el formulario y envía creación a la API.
   * @returns {Promise<{ok: boolean, data?: any}> | false}
   */
  const validateAndSave = async () => {
    // Creamos copia del schema base
    const schema = [...baseSchema];

    // Regla dinámica: si es tipo "3" (reposición) → agregamos validación de fecha original
    if (String(form.class_type_id) === "3") {
      schema.push({
        name: "original_date",
        type: "date",
        required: true,
        // Podrías agregar aquí min/max si tu validador lo soporta
      });
    }

    // Ejecutamos validación cliente-side
    const result = validarCamposReact(form, schema);

    // Si falla → mostramos errores y salimos
    if (!result.ok) {
      setErrors(result.errors || {});   // { instructor_id: "Este campo es requerido", ... }
      return false;
    }

    try {
      setLoading(true);   // Activar spinner / deshabilitar botón

      // Construimos payload con conversiones correctas de tipo
      // (la API espera números en IDs, strings en horas y null en opcionales vacíos)
      const payload = {
        instructor_id:        Number(form.instructor_id),        // "42" → 42
        classroom_id:         Number(form.classroom_id),
        time_slot_id:         Number(form.time_slot_id),
        schedule_session_id:  Number(form.schedule_session_id),
        class_type_id:        Number(form.class_type_id),
        start_hour:           form.start_hour,                   // "08:00" (se valida formato en backend)
        end_hour:             form.end_hour,
        observations:         form.observations?.trim() || null, // "" → null

        // Lógica condicional para fecha original
        original_date: String(form.class_type_id) === "3"
          ? (form.original_date || null)                         // "2025-03-15" o null
          : null,
      };

      // Envío real a la API (POST)
      const res = await api.post("real_classes", payload);

      // Respuesta NO exitosa (400, 422, 500, etc.)
      if (!res.ok) {
        // Mostramos mensaje específico del backend si existe
        await error(res.message || "No se pudo crear la clase.");
        return false;
      }

      // Éxito
      await success(res.message || "Clase creada con éxito.");
      
      // Retornamos estructura útil para el componente que lo use
      // (puede querer redirigir, limpiar form, etc.)
      return { ok: true, data: res.data };

    } catch (e) {
      // Errores de red, timeout, CORS, 5xx no capturados por apiClient, etc.
      console.error("[useRealClassCreate] Error al crear clase:", e);
      await error(e?.message || "Error de conexión. Por favor intenta nuevamente.");
      return false;

    } finally {
      // SIEMPRE desactivamos loading (éxito o error)
      setLoading(false);
    }
  };

  // API pública del hook (lo que puede usar el componente)
  return {
    form,             // Estado actual del formulario (para value={form.xxx})
    errors,           // Errores por campo (para mostrar debajo de inputs)
    loading,          // ¿Está enviando? (para spinner y disabled)
    onChange,         // Función única para todos los onChange
    validateAndSave,  // Función que valida + guarda (se llama en onSubmit)
  };
}