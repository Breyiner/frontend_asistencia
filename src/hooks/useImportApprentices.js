// hooks/useImportApprentices.js

// ─── React ────────────────────────────────────────────────────────────────────
import { useState, useRef } from "react";

// ─── Cliente API y utilidades ─────────────────────────────────────────────────
import { api }            from "../services/apiClient";
import { success, error } from "../utils/alertas";


/**
 * Hook para manejar la importación masiva de aprendices desde Excel.
 *
 * ── Responsabilidades ────────────────────────────────────────────────────────
 * · Estado y handlers del ImportModal  (abrir, cerrar, loading de import)
 * · Estado y handlers del ImportErrorModal (abrir, cerrar, datos de errores)
 * · POST apprentices/import → detecta errorKey del backend
 * · GET  apprentices/import/errors-excel → blob → descarga automática del archivo
 * · Ref para disparar refetch de la tabla tras importación exitosa
 *
 * ── Lo que este hook NO hace ─────────────────────────────────────────────────
 * · No renderiza JSX (lógica pura, sin componentes)
 * · No genera el Excel en el cliente (delegado al backend via ImportErrorsExport)
 *
 * ── Flujo completo ────────────────────────────────────────────────────────────
 * 1. openImportModal()   → usuario abre el ImportModal
 * 2. handleImport(file)  → POST apprentices/import con el archivo
 *    a. Éxito total               → success alert + refetch tabla + cierra modal
 *    b. import_apprentices_failed → cierra ImportModal, abre ImportErrorModal
 *    c. Otro error (red/timeout)  → error alert genérico
 * 3. handleDownloadErrors() → GET apprentices/import/errors-excel
 *    · Backend lee caché (10 min TTL) y genera Excel con ImportErrorsExport
 *    · Respuesta blob → URL temporal → descarga automática → limpia recursos
 *
 * @hook
 * @returns {Object} Estados y handlers para ImportModal e ImportErrorModal
 */
export const useImportApprentices = () => {

  // ── Estado: ImportModal ───────────────────────────────────────────────────
  const [isImportModalOpen, setIsImportModalOpen] = useState(false); // Visibilidad del modal
  const [importing, setImporting]                 = useState(false); // true durante POST

  // ── Estado: ImportErrorModal ──────────────────────────────────────────────
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false); // Visibilidad del modal
  const [importErrorData, setImportErrorData]   = useState(null);  // { message, errors[] } | null
  const [downloadingErrors, setDownloadingErrors] = useState(false); // true durante GET blob

  // ── Ref: refetch de tabla ─────────────────────────────────────────────────
  // DataListLayout expone su función refetch via onRefetchReady.
  // Se guarda aquí para poder llamarla tras una importación exitosa.
  const refetchRef = useRef(null);


  // ── Handlers ──────────────────────────────────────────────────────────────

  /**
   * Ejecuta la importación masiva enviando el archivo al backend.
   *
   * El apiClient nunca lanza excepción, siempre resuelve con { ok, errorKey, ... }.
   * Por eso no se usa try/catch: se detectan los casos por errorKey y ok.
   *
   * Casos posibles:
   * · errorKey = "import_apprentices_failed" → hay filas rechazadas
   *   - Guarda { message, errors } en importErrorData para el ImportErrorModal
   *   - Cierra ImportModal y abre ImportErrorModal
   * · !res.ok (otro error) → red, timeout, validación genérica
   *   - Muestra alerta de error con el mensaje del backend
   * · res.ok → todas las filas se importaron correctamente
   *   - Muestra alerta de éxito y dispara refetch de la tabla
   *
   * @param {File} file - Archivo Excel seleccionado por el usuario en ImportModal
   */
  const handleImport = async (file) => {
    setImporting(true);

    // FormData es necesario para enviar archivos binarios (multipart/form-data).
    // El apiClient detecta FormData y no agrega Content-Type: application/json.
    const formData = new FormData();
    formData.append("file", file);

    const res = await api.post("apprentices/import", formData);

    // ── Caso: filas rechazadas ──────────────────────────────────────────────
    // El backend responde con 206 + errorKey cuando al menos una fila falló.
    // res.errors = [{ fila, errores[], valores }] con todas las filas fallidas.
    if (res.errorKey === "import_apprentices_failed") {
      setImportErrorData({ message: res.message, errors: res.errors });
      setIsImportModalOpen(false); // Cierra ImportModal
      setIsErrorModalOpen(true);   // Abre ImportErrorModal con los errores
      setImporting(false);
      return;
    }

    // ── Caso: otro error (red, timeout, validación de archivo) ───────────────
    if (!res.ok) {
      error(res.message || "No se pudo importar el archivo.");
      setImporting(false);
      return;
    }

    // ── Caso: éxito total ─────────────────────────────────────────────────────
    success(res.message || "Aprendices importados con éxito.");
    setIsImportModalOpen(false);
    refetchRef.current?.(); // Recarga la tabla para mostrar los nuevos aprendices
    setImporting(false);
  };

  /**
   * Descarga el Excel de errores desde el backend.
   *
   * El backend (GET apprentices/import/errors-excel):
   * · Lee el caché del usuario autenticado (TTL 10 min)
   * · Genera el Excel con ImportErrorsExport (mismo estilo plantilla + columna roja)
   * · Retorna el archivo como blob binario
   *
   * Si el caché expiró (pasaron más de 10 min) el backend responde 404
   * y api.downloadFile retorna { ok: false }.
   *
   * Flujo del blob:
   * 1. Crea URL temporal (blob:http://...)
   * 2. Crea <a> oculto con href y download attribute
   * 3. Simula click → el navegador descarga el archivo
   * 4. Limpia: remueve <a> del DOM y revoca la URL para liberar memoria
   */
  const handleDownloadErrors = async () => {
    // Protección: no hace nada si no hay errores cargados
    if (!importErrorData?.errors?.length) return;

    setDownloadingErrors(true);

    const res = await api.downloadFile("apprentices/import/errors-excel");

    // ── Error: caché expirado, sin permiso, red, etc. ─────────────────────────
    if (!res.ok) {
      error(res.message || "No se pudo generar el archivo de errores.");
      setDownloadingErrors(false);
      return;
    }

    // ── Éxito: fuerza descarga del blob en el navegador ───────────────────────
    const url  = window.URL.createObjectURL(res.blob); // URL temporal tipo blob:http://...
    const link = document.createElement("a");
    link.href     = url;
    link.download = "aprendices_con_errores.xlsx";
    document.body.appendChild(link); // Necesario en algunos navegadores (Firefox)
    link.click();
    document.body.removeChild(link); // Limpia el <a> del DOM
    window.URL.revokeObjectURL(url); // Libera memoria del blob

    setDownloadingErrors(false);
  };

  /**
   * Cierra el ImportErrorModal y limpia los datos de errores.
   * Se llama desde el botón "Cerrar" del ImportErrorModal.
   */
  const handleCloseErrorModal = () => {
    setIsErrorModalOpen(false);
    setImportErrorData(null);
  };


  // ── API pública del hook ───────────────────────────────────────────────────
  return {
    // ImportModal
    isImportModalOpen,                        // boolean
    importing,                                // boolean
    openImportModal:  () => setIsImportModalOpen(true),
    closeImportModal: () => setIsImportModalOpen(false),
    handleImport,                             // (file: File) => Promise<void>

    // ImportErrorModal
    isErrorModalOpen,                         // boolean
    importErrorData,                          // { message, errors[] } | null
    downloadingErrors,                        // boolean
    handleCloseErrorModal,                    // () => void
    handleDownloadErrors,                     // () => Promise<void>

    // Ref para DataListLayout → onRefetchReady
    refetchRef,                               // React.MutableRefObject<Function|null>
  };
};
