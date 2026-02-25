// components/ImportErrorModal/ImportErrorModal.jsx

// ─── React ────────────────────────────────────────────────────────────────────
import { useState } from "react";

// ─── Iconos ───────────────────────────────────────────────────────────────────
import {
  RiCloseLine,        // Botón cerrar (X) en la cabecera
  RiErrorWarningLine, // Icono de advertencia en la cabecera
  RiFileExcel2Line,   // Icono Excel en el botón de descarga
  RiDownloadLine,     // Icono de descarga en el botón de descarga
  RiFileWarningLine,  // Icono de archivo con error en el banner resumen
  RiArrowDownSLine,   // Flecha hacia abajo para expandir fila
  RiArrowUpSLine,     // Flecha hacia arriba para colapsar fila
} from "@remixicon/react";

// ─── Componentes reutilizables ────────────────────────────────────────────────
import Button from "../Button/Button";

// ─── Estilos ──────────────────────────────────────────────────────────────────
import "./ImportErrorModal.css";


/**
 * Modal para mostrar los errores de una importación masiva fallida.
 *
 * ── Cuándo se muestra ────────────────────────────────────────────────────────
 * Se abre automáticamente cuando el backend responde con:
 *   { errorKey: "import_apprentices_failed", errors: [{fila, errores, valores}] }
 * El hook useImportApprentices detecta el errorKey y pasa los datos via errorData.
 *
 * ── Estructura de errorData ──────────────────────────────────────────────────
 * {
 *   message: "30 fallaron",
 *   errors: [
 *     {
 *       fila:    2,
 *       errores: ["Este documento ya está registrado", "Este correo ya está registrado"],
 *       valores: { nombres, apellidos, telefono, tipo_documento, ... }
 *     },
 *     ...
 *   ]
 * }
 *
 * ── Funcionalidades ──────────────────────────────────────────────────────────
 * · Banner resumen con total de filas fallidas
 * · Lista de filas con errores, cada una expandible para ver detalle
 * · Chips de error por fila (uno por cada mensaje)
 * · Panel expandido con grid de todos los valores de la fila
 * · Botón para descargar Excel de errores (mismo estilo plantilla + columna roja)
 *
 * @component
 * @param {Object}   props
 * @param {boolean}  props.isOpen              - Controla visibilidad del modal
 * @param {Function} props.onClose             - Callback para cerrar el modal
 * @param {Object}   props.errorData           - Datos de error del backend
 * @param {string}   props.errorData.message   - Mensaje general (ej: "30 fallaron")
 * @param {Array}    props.errorData.errors    - Filas con errores [{fila, errores[], valores}]
 * @param {Function} [props.onDownloadErrors]  - Callback para descargar el Excel de errores
 * @param {boolean}  [props.downloadingErrors] - true mientras se descarga el Excel
 *
 * @example
 * <ImportErrorModal
 *   isOpen={isErrorModalOpen}
 *   onClose={handleCloseErrorModal}
 *   errorData={importErrorData}
 *   onDownloadErrors={handleDownloadErrors}
 *   downloadingErrors={downloadingErrors}
 * />
 */
export default function ImportErrorModal({
  isOpen,
  onClose,
  errorData,
  onDownloadErrors,
  downloadingErrors = false,
}) {
  // Número de fila actualmente expandida (null = todas colapsadas)
  const [expandedRow, setExpandedRow] = useState(null);

  // Early return: no renderiza nada si el modal está cerrado
  if (!isOpen) return null;

  // Extrae y normaliza datos del errorData
  const errors      = errorData?.errors  ?? [];
  const message     = errorData?.message ?? "Algunos registros fallaron";
  const totalErrors = errors.length;


  /**
   * Alterna la expansión de una fila de error.
   * Si la fila ya estaba expandida, la colapsa.
   * Si era otra fila, expande la nueva y colapsa la anterior.
   *
   * @param {number} fila - Número de fila del Excel (viene de item.fila)
   */
  const toggleRow = (fila) => {
    setExpandedRow((prev) => (prev === fila ? null : fila));
  };

  /**
   * Filtra los valores de una fila eliminando las claves numéricas.
   *
   * Excel puede generar columnas vacías con claves numéricas ("0", "1", etc.)
   * que no corresponden a campos reales del aprendiz.
   * Se mantienen solo las claves con nombre (nombres, apellidos, email, etc.)
   *
   * @param {Object} valores - Objeto de valores de la fila del Excel
   * @returns {Array<[string, any]>} Pares [clave, valor] sin columnas vacías
   */
  const getRelevantValues = (valores) =>
    Object.entries(valores).filter(([key]) => isNaN(Number(key)));


  return (
    // Backdrop oscuro con atributos de accesibilidad para lectores de pantalla
    <div className="import-error-modal__backdrop" role="dialog" aria-modal="true">

      {/* ── Contenedor principal del modal ── */}
      <div className="import-error-modal">

        {/* ── Cabecera: título + botón cerrar ── */}
        <div className="import-error-modal__header">
          <div className="import-error-modal__header-left">
            {/* Icono decorativo de advertencia */}
            <div className="import-error-modal__header-icon">
              <RiErrorWarningLine size={20} />
            </div>
            <div className="import-error-modal__title">Errores en la importación</div>
          </div>

          {/* Botón cerrar: deshabilitado mientras descarga para evitar cierre accidental */}
          <button
            type="button"
            className="import-error-modal__close"
            onClick={onClose}
            disabled={downloadingErrors}
          >
            <RiCloseLine size={20} />
          </button>
        </div>

        {/* ── Banner de resumen ── */}
        {/* Muestra el mensaje del backend (ej: "30 fallaron") y el total como badge */}
        <div className="import-error-modal__summary">
          <div className="import-error-modal__summary-icon">
            <RiFileWarningLine size={22} />
          </div>
          <div className="import-error-modal__summary-text">
            <span className="import-error-modal__summary-title">{message}</span>
            <span className="import-error-modal__summary-sub">
              Revisa los registros a continuación para corregir los datos e intentar nuevamente.
            </span>
          </div>
          {/* Badge con el número total de filas fallidas */}
          <div className="import-error-modal__summary-badge">{totalErrors}</div>
        </div>

        {/* ── Lista de filas con errores ── */}
        {/* Cada item es expandible para ver el detalle de valores de la fila */}
        <div className="import-error-modal__list">
          {errors.map((item) => {
            const isExpanded = expandedRow === item.fila;
            const values     = getRelevantValues(item.valores);

            return (
              <div
                key={item.fila}
                className={`import-error-modal__item ${
                  isExpanded ? "import-error-modal__item--expanded" : ""
                }`}
              >
                {/* ── Fila clickeable (header del item) ── */}
                <button
                  type="button"
                  className="import-error-modal__item-header"
                  onClick={() => toggleRow(item.fila)}
                >
                  {/* Número de fila del Excel */}
                  <span className="import-error-modal__item-row">
                    Fila {item.fila}
                  </span>

                  {/* Nombre completo del aprendiz de esa fila */}
                  <span className="import-error-modal__item-name">
                    {item.valores.nombres} {item.valores.apellidos}
                  </span>

                  {/* Chips de error: uno por cada mensaje de validación fallido */}
                  <div className="import-error-modal__item-errors">
                    {item.errores.map((err, i) => (
                      <span key={i} className="import-error-modal__error-chip">
                        {err}
                      </span>
                    ))}
                  </div>

                  {/* Flecha que indica si el panel está expandido o colapsado */}
                  <span className="import-error-modal__item-arrow">
                    {isExpanded
                      ? <RiArrowUpSLine size={18} />
                      : <RiArrowDownSLine size={18} />
                    }
                  </span>
                </button>

                {/* ── Panel de detalle expandible ── */}
                {/* Solo se renderiza cuando la fila está expandida */}
                {isExpanded && (
                  <div className="import-error-modal__item-detail">
                    {/* Grid con todos los pares clave/valor de la fila */}
                    <div className="import-error-modal__detail-grid">
                      {values.map(([key, value]) => (
                        <div key={key} className="import-error-modal__detail-field">
                          {/* Nombre del campo (ej: email, numero_documento) */}
                          <span className="import-error-modal__detail-label">
                            {key}
                          </span>
                          {/* Valor del campo, con estilo especial si es null/vacío */}
                          <span
                            className={`import-error-modal__detail-value ${
                              value === null
                                ? "import-error-modal__detail-value--null"
                                : ""
                            }`}
                          >
                            {value !== null ? String(value) : "—"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* ── Footer: botones de acción ── */}
        <div className="import-error-modal__footer">

          {/* Botón secundario: cierra el modal sin descargar */}
          <Button variant="secondary" onClick={onClose} disabled={downloadingErrors}>
            Cerrar
          </Button>

          {/* Botón primario: descarga el Excel con solo las filas fallidas.
              Solo se renderiza si se pasó el callback onDownloadErrors.
              El backend genera el Excel con ImportErrorsExport (caché 10 min). */}
          {onDownloadErrors && (
            <Button
              variant="primary"
              onClick={onDownloadErrors}
              disabled={downloadingErrors}
            >
              <RiFileExcel2Line size={18} />
              <span>
                {downloadingErrors
                  ? "Descargando..."
                  : "Descargar registros con errores"
                }
              </span>
              {/* Icono de descarga solo visible cuando no está descargando */}
              {!downloadingErrors && <RiDownloadLine size={16} />}
            </Button>
          )}
        </div>

      </div>
    </div>
  );
}
