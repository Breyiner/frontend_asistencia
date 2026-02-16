// Importa librería SweetAlert2 para alertas modales elegantes
import Swal from "sweetalert2";

/**
 * Muestra una alerta de éxito.
 * 
 * Características:
 * - Icono de check verde
 * - Draggable (se puede arrastrar)
 * - Clase personalizada para aparecer sobre modales
 * 
 * @function
 * @param {string} message - Mensaje de éxito a mostrar
 * @returns {Promise} Promise de SweetAlert2
 * 
 * @example
 * await success("Usuario creado exitosamente");
 */
export const success = (message) => {
  return Swal.fire({
    title: message,
    icon: "success",
    draggable: true,
    customClass: {
      // Clase CSS para que aparezca sobre otros modales
      container: "swal-over-modal",
    },
  });
};

/**
 * Muestra una alerta de error.
 * 
 * Características:
 * - Icono de X rojo
 * - Título fijo "Ups, se presentó un error"
 * - Mensaje de error como texto
 * - Draggable
 * 
 * @function
 * @param {string} message - Mensaje de error a mostrar
 * @returns {Promise} Promise de SweetAlert2
 * 
 * @example
 * await error("No se pudo conectar al servidor");
 */
export const error = (message) => {
  return Swal.fire({
    title: "Ups, se presentó un error",
    text: message,
    icon: "error",
    draggable: true,
    customClass: {
      container: "swal-over-modal",
    },
  });
};

/**
 * Muestra un diálogo de confirmación.
 * 
 * Características:
 * - Icono de advertencia amarillo
 * - Botones Sí/No con colores diferenciados
 * - Retorna Promise con propiedad isConfirmed
 * 
 * @function
 * @param {string} message - Mensaje de confirmación
 * @returns {Promise<Object>} Promise con {isConfirmed: boolean}
 * 
 * @example
 * const result = await confirm("¿Eliminar este usuario?");
 * if (result.isConfirmed) {
 *   // Usuario confirmó
 *   deleteUser();
 * }
 */
export const confirm = (message) => {
  return Swal.fire({
    title: "Precaución",
    text: message,
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6", // Azul
    cancelButtonColor: "#d33",     // Rojo
    confirmButtonText: "Sí",
    cancelButtonText: "No",
    customClass: {
      container: "swal-over-modal",
    },
  });
};

/**
 * Muestra un diálogo de carga (loading).
 * 
 * Características:
 * - Muestra spinner de Bootstrap
 * - No se puede cerrar (no tiene botones)
 * - No permite click fuera, Escape ni Enter
 * - Útil para operaciones que toman tiempo
 * 
 * Para cerrar: Swal.close()
 * 
 * @function
 * @param {string} [message="Cerrando sesión..."] - Mensaje de carga
 * @returns {Promise} Promise de SweetAlert2
 * 
 * @example
 * loading("Procesando datos...");
 * await processData();
 * Swal.close();
 */
export const loading = (message = "Cerrando sesión...") => {
  return Swal.fire({
    title: message,
    // HTML personalizado con spinner de Bootstrap
    html:
      '<div class="spinner-border text-primary" role="status"><span class="sr-only">Cargando...</span></div>',
    showConfirmButton: false,
    showCancelButton: false,
    // Bloquea interacción del usuario
    allowOutsideClick: false,
    allowEscapeKey: false,
    allowEnterKey: false,
    // Hook al abrir: activa animación de carga de SweetAlert2
    didOpen: () => {
      Swal.showLoading();
    },
    customClass: {
      container: "swal-over-modal",
    },
  });
};

/**
 * Muestra un diálogo de información.
 * 
 * Características:
 * - Icono "i" azul
 * - Draggable
 * - Para mensajes informativos neutrales
 * 
 * @function
 * @param {string} message - Mensaje informativo
 * @returns {Promise} Promise de SweetAlert2
 * 
 * @example
 * await info("El proceso puede tardar unos minutos");
 */
export const info = (message) => {
  return Swal.fire({
    title: "Información",
    text: message,
    icon: "info",
    draggable: true,
    customClass: {
      container: "swal-over-modal",
    },
  });
}