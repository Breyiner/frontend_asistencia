import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/apiClient";                  // Cliente HTTP con auth, baseURL, interceptores, etc.
import { success, error, info } from "../utils/alertas";     // Alertas preconfiguradas (SweetAlert2 o similar)

/**
 * Hook para manejar el proceso completo de REGISTRO de un nuevo usuario.
 * 
 * Flujo principal:
 * 1. Recibe datos del formulario (first_name, last_name, document_type_id, etc.)
 * 2. Limpia y normaliza los valores (trim, Number donde corresponde)
 * 3. Envía POST a /register
 * 4. Maneja éxito: alerta + mensaje de verificación por email + redirección a login
 * 5. Maneja error: muestra mensaje específico o genérico
 * 
 * No incluye validación cliente-side aquí (se asume que el componente la hace antes)
 */
export function useRegister() {
  const navigate = useNavigate();               // Para redirigir a /login tras éxito

  // Indicador de operación en curso (deshabilita botón, muestra spinner)
  const [loading, setLoading] = useState(false);

  // Mensaje de error persistente (puede mostrarse en el formulario)
  const [errorMsg, setErrorMsg] = useState("");

  /**
   * Ejecuta el registro del usuario.
   * @param {Object} data - Datos crudos del formulario
   * @returns {Promise<Object|null>} - Respuesta de la API o null en error grave
   */
  const register = async (data) => {
    setLoading(true);           // Activar estado de carga
    setErrorMsg("");            // Limpiar error previo

    // Normalización y limpieza de datos antes de enviar
    const payload = {
      first_name:       (data.first_name || "").trim(),                    // Elimina espacios innecesarios
      last_name:        (data.last_name || "").trim(),
      document_type_id: Number.parseInt(String(data.document_type_id), 10), // Convierte a entero seguro
      document_number:  String(data.document_number || "").trim(),
      telephone_number: String(data.telephone_number || "").trim(),
      email:            (data.email || "").trim(),
      password:         String(data.password || ""),                       // No se trimmea por si incluye espacios intencionales
    };

    try {
      // Envío real al endpoint de registro
      const res = await api.post("register", payload);

      if (!res.ok) {
        // Error controlado por backend (422, 400, etc.)
        const msg = res.message || "No se pudo registrar";
        setErrorMsg(msg);
        await error(msg);
        return res;   // Retornamos para que el componente pueda inspeccionar
      }

      // Éxito
      await success(res.message || "Registro exitoso");

      // Mensaje adicional importante: verificación por correo
      await info(
        "Te enviamos un correo de verificación. " +
        "Confirma tu cuenta para poder iniciar sesión. " +
        "Revisa spam si no aparece en unos minutos."
      );

      // Redirección limpia (replace: true → no se puede volver atrás con botón)
      navigate("/login", { replace: true });

      return res;   // Para que el componente pueda hacer algo más si quiere

    } catch (e) {
      // Errores de red, timeout, CORS, 5xx inesperados, etc.
      const msg = e.message || "Error de conexión. Intenta de nuevo.";
      setErrorMsg(msg);
      await error(msg);
      return null;   // Indicador claro de fallo grave
    } finally {
      setLoading(false);   // SIEMPRE desactivamos loading
    }
  };

  // API pública del hook
  return {
    register,       // La función principal que llama el componente
    loading,        // ¿Está procesando el registro?
    error: errorMsg // Mensaje de error para mostrar en UI
  };
}