// Importa useState de React
import { useState } from 'react';

// Importa cliente de API
import { api } from '../services/apiClient';

/**
 * Hook personalizado para descargar plantillas de archivos.
 * 
 * Gestiona el proceso de descarga de archivos plantilla (Excel, PDF, etc.)
 * desde el backend hacia el navegador del usuario.
 * 
 * Características:
 * - Manejo de estados de descarga
 * - Gestión de errores
 * - Descarga automática mediante blob y anchor element
 * - Limpieza automática de recursos
 * 
 * Flujo:
 * 1. Llama a endpoint del backend que retorna archivo
 * 2. Recibe respuesta como blob
 * 3. Crea URL temporal del blob
 * 4. Crea elemento <a> temporal y simula click
 * 5. Limpia recursos (URL y elemento DOM)
 * 
 * Casos de uso:
 * - Descargar plantilla de importación de aprendices
 * - Descargar plantilla de carga masiva
 * - Descargar formatos de ejemplo
 * 
 * @hook
 * 
 * @returns {Object} Objeto con función de descarga y estados
 * @returns {Function} returns.downloadTemplate - Función async para descargar
 * @returns {boolean} returns.isDownloading - Estado de descarga en progreso
 * @returns {string|null} returns.error - Mensaje de error si falla la descarga
 * 
 * @example
 * function ImportModal() {
 *   const { downloadTemplate, isDownloading, error } = useTemplateDownload();
 *   
 *   const handleDownload = async () => {
 *     const success = await downloadTemplate(
 *       'apprentices/template/download',
 *       'plantilla_aprendices.xlsx'
 *     );
 *     
 *     if (!success) {
 *       alert('Error al descargar plantilla');
 *     }
 *   };
 *   
 *   return (
 *     <button onClick={handleDownload} disabled={isDownloading}>
 *       {isDownloading ? 'Descargando...' : 'Descargar Plantilla'}
 *     </button>
 *   );
 * }
 */
export const useTemplateDownload = () => {
  
  // Estado que indica si hay descarga en progreso
  const [isDownloading, setIsDownloading] = useState(false);
  
  // Estado para almacenar mensaje de error
  const [error, setError] = useState(null);

  /**
   * Descarga un archivo plantilla del backend.
   * 
   * Proceso:
   * 1. Activa estado de descarga y limpia errores
   * 2. Llama a api.downloadFile que retorna un blob
   * 3. Crea URL temporal del blob
   * 4. Crea elemento <a> con href al blob
   * 5. Simula click en el elemento (inicia descarga)
   * 6. Limpia elemento del DOM y libera URL
   * 7. Retorna true si exitoso, false si falla
   * 
   * @async
   * @param {string} templateUrl - Endpoint relativo del backend (ej: 'apprentices/template/download')
   * @param {string} [fileName='plantilla.xlsx'] - Nombre del archivo a descargar
   * @returns {Promise<boolean>} true si descarga exitosa, false si falla
   * 
   * @example
   * // Descargar plantilla de aprendices
   * await downloadTemplate(
   *   'apprentices/template/download',
   *   'plantilla_importacion.xlsx'
   * );
   * 
   * @example
   * // Descargar plantilla de fichas
   * await downloadTemplate(
   *   'fichas/template',
   *   'plantilla_fichas.xlsx'
   * );
   */
  const downloadTemplate = async (templateUrl, fileName = 'plantilla.xlsx') => {
    // Activa estado de descarga
    setIsDownloading(true);
    
    // Limpia error previo
    setError(null);

    try {
      /**
       * Llama a método especializado del API client.
       * 
       * api.downloadFile maneja la respuesta como blob
       * en lugar de JSON, necesario para archivos binarios.
       */
      const response = await api.downloadFile(templateUrl);

      // Verifica si la respuesta fue exitosa
      if (!response.ok) {
        throw new Error(response.message || 'Error al descargar la plantilla');
      }

      /**
       * Crea URL temporal del blob.
       * 
       * window.URL.createObjectURL crea un URL especial (blob:...)
       * que apunta al blob en memoria.
       */
      const url = window.URL.createObjectURL(response.blob);
      
      /**
       * Crea elemento <a> temporal para forzar descarga.
       * 
       * Este es el método estándar para descargar archivos
       * desde JavaScript sin navegar.
       */
      const link = document.createElement('a');
      link.href = url;                    // URL del blob
      link.download = fileName;            // Nombre del archivo
      
      // Agrega al DOM (necesario para que funcione en algunos navegadores)
      document.body.appendChild(link);
      
      // Simula click en el enlace (inicia descarga)
      link.click();
      
      /**
       * Limpieza de recursos.
       * 
       * Es importante limpiar para:
       * - Liberar memoria del blob
       * - Remover elemento del DOM
       */
      document.body.removeChild(link);    // Remueve elemento del DOM
      window.URL.revokeObjectURL(url);     // Libera URL del blob

      // Retorna true indicando éxito
      return true;
      
    } catch (err) {
      // Log del error para debugging
      console.error('Error descargando plantilla:', err);
      
      // Guarda mensaje de error en el estado
      setError(err.message);
      
      // Retorna false indicando fallo
      return false;
      
    } finally {
      // Siempre desactiva estado de descarga
      setIsDownloading(false);
    }
  };

  // Retorna función de descarga y estados
  return { downloadTemplate, isDownloading, error };
};