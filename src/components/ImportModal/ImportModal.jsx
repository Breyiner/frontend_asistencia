// Importa hooks de React para manejo de estado y referencias
import { useState, useRef } from "react";

// Importa iconos de Remix Icon para la interfaz del modal
import { 
  RiCloseLine,        // Icono de cerrar (X)
  RiDownloadLine,     // Icono de descarga
  RiCheckLine,        // Icono de check para lista de instrucciones
  RiFileTextLine,     // Icono de archivo genérico
  RiFileExcel2Line    // Icono específico de Excel
} from "@remixicon/react";

// Importa componentes reutilizables
import Button from "../Button/Button";

// Importa hook personalizado para manejar descarga de plantillas
import { useTemplateDownload } from "../../hooks/useTemplateDownload";

// Importa estilos del modal de importación
import "./ImportModal.css";

// Importa utilidad para mostrar mensajes de error
import { error } from "../../utils/alertas";

/**
 * Modal para importación masiva de datos mediante archivos Excel.
 * 
 * Proporciona una interfaz completa para:
 * - Descargar plantilla Excel predefinida
 * - Mostrar instrucciones de importación
 * - Arrastrar y soltar archivos o seleccionarlos manualmente
 * - Validar formato de archivo (solo .xlsx, .xls)
 * - Vista previa del archivo seleccionado
 * - Botón para ejecutar la importación
 * 
 * Características:
 * - Drag & drop de archivos
 * - Validación de extensión
 * - Estados de carga (descargando plantilla, importando)
 * - Instrucciones personalizables
 * - Manejo de errores
 * 
 * @component
 * 
 * @param {Object} props - Propiedades del componente
 * @param {boolean} props.isOpen - Controla visibilidad del modal
 * @param {Function} props.onClose - Callback para cerrar el modal
 * @param {Function} props.onImport - Callback ejecutado al importar (recibe el archivo)
 * @param {string} [props.title="Importar Archivo"] - Título del modal
 * @param {string} [props.subtitle="Importación masiva de aprendices"] - Subtítulo descriptivo
 * @param {string} [props.templateUrl="apprentices/template/download"] - Endpoint para descargar plantilla
 * @param {string} [props.templateFileName="plantilla_importacion.xlsx"] - Nombre del archivo de plantilla
 * @param {Array<string>} [props.instructions] - Lista de instrucciones a mostrar
 * @param {string} [props.acceptedFormats=".xlsx,.xls"] - Formatos aceptados para el input file
 * @param {boolean} [props.loading=false] - Indica si está en proceso de importación
 * 
 * @returns {JSX.Element|null} Modal de importación o null si está cerrado
 * 
 * @example
 * <ImportModal
 *   isOpen={showImportModal}
 *   onClose={() => setShowImportModal(false)}
 *   onImport={(file) => handleImport(file)}
 *   title="Importar Aprendices"
 *   templateUrl="apprentices/template/download"
 *   instructions={[
 *     "Descarga la plantilla Excel",
 *     "Llena los campos obligatorios",
 *     "Sube el archivo completado"
 *   ]}
 *   loading={isImporting}
 * />
 */
export default function ImportModal({ 
  isOpen, 
  onClose, 
  onImport, 
  title = "Importar Archivo",
  subtitle = "Importación masiva de aprendices",
  templateUrl = "apprentices/template/download",
  templateFileName = "plantilla_importacion.xlsx",
  instructions = [
    "Descarga la plantilla y llénala con los datos de los aprendices",
    "Los campos obligatorios son: nombres, apellidos, teléfono, tipo_documento, numero_documento, email, fecha_nacimiento y numero_ficha",
    "El tipo_documento debe ser el acrónimo (CC, TI, CE, etc.)",
    "El numero_ficha debe existir en el sistema",
    "El archivo debe estar en formato .xlsx o .xls"
  ],
  acceptedFormats = ".xlsx,.xls",
  loading = false
}) {
  
  // Estado para almacenar el archivo seleccionado
  // null cuando no hay archivo seleccionado
  const [selectedFile, setSelectedFile] = useState(null);
  
  // Estado para controlar el estilo visual durante drag & drop
  // true cuando un archivo está siendo arrastrado sobre la zona de drop
  const [isDragging, setIsDragging] = useState(false);
  
  // Referencia al input file oculto para poder limpiarlo programáticamente
  const fileInputRef = useRef(null);
  
  // Hook personalizado para manejar descarga de plantillas
  // Proporciona función downloadTemplate y estados isDownloading y error
  const { downloadTemplate, isDownloading, error: downloadError } = useTemplateDownload();

  // Si el modal no está abierto, no renderiza nada (early return)
  if (!isOpen) return null;

  /**
   * Maneja la descarga de la plantilla Excel.
   * 
   * Llama al hook useTemplateDownload para descargar el archivo
   * y muestra un error si la descarga falla.
   * 
   * @async
   * @function
   */
  const handleDownloadTemplate = async () => {
    // Intenta descargar la plantilla
    const success = await downloadTemplate(templateUrl, templateFileName);
    
    // Si falla, muestra un mensaje de error al usuario
    if (!success) {
      error('Error al descargar la plantilla. Por favor intenta nuevamente.');
    }
  };

  /**
   * Maneja el evento dragover (arrastrar sobre la zona de drop).
   * 
   * Previene el comportamiento por defecto del navegador y
   * activa el estado visual de "arrastrando".
   * 
   * @param {DragEvent} e - Evento de arrastre
   */
  const handleDragOver = (e) => {
    e.preventDefault(); // Previene que el navegador abra el archivo
    setIsDragging(true);
  };

  /**
   * Maneja el evento dragleave (salir de la zona de drop).
   * 
   * Desactiva el estado visual de "arrastrando".
   * 
   * @param {DragEvent} e - Evento de arrastre
   */
  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  /**
   * Maneja el evento drop (soltar archivo en la zona).
   * 
   * Extrae el primer archivo soltado y lo procesa
   * mediante handleFileSelection.
   * 
   * @param {DragEvent} e - Evento de soltar
   */
  const handleDrop = (e) => {
    e.preventDefault(); // Previene que el navegador abra el archivo
    setIsDragging(false);
    
    // Obtiene los archivos del evento de drop
    const files = e.dataTransfer.files;
    
    // Si hay al menos un archivo, procesa el primero
    if (files.length > 0) {
      handleFileSelection(files[0]);
    }
  };

  /**
   * Valida y establece el archivo seleccionado.
   * 
   * Solo acepta archivos con extensión .xlsx o .xls.
   * Muestra alerta si el formato no es válido.
   * 
   * @param {File} file - Archivo a validar y seleccionar
   */
  const handleFileSelection = (file) => {
    // Extrae la extensión del archivo (última parte después del último punto)
    const extension = file.name.split(".").pop().toLowerCase();
    
    // Valida que sea un archivo Excel válido
    if (extension === "xlsx" || extension === "xls") {
      setSelectedFile(file); // Almacena el archivo válido
    } else {
      // Muestra alerta si el formato no es válido
      alert("Por favor selecciona un archivo Excel (.xlsx o .xls)");
    }
  };

  /**
   * Maneja el cambio en el input file (cuando se selecciona archivo manualmente).
   * 
   * Extrae el primer archivo seleccionado y lo procesa.
   * 
   * @param {Event} e - Evento change del input
   */
  const handleFileInputChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFileSelection(file);
    }
  };

  /**
   * Remueve el archivo seleccionado.
   * 
   * Limpia el estado y resetea el input file para permitir
   * seleccionar el mismo archivo nuevamente si es necesario.
   * 
   * @param {Event} e - Evento de click
   */
  const handleRemoveFile = (e) => {
    e.stopPropagation(); // Previene que se active el click del dropzone
    setSelectedFile(null);
    
    // Limpia el valor del input file
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  /**
   * Ejecuta la importación del archivo seleccionado.
   * 
   * Llama al callback onImport pasando el archivo.
   * 
   * @function
   */
  const handleImportClick = () => {
    if (selectedFile) {
      onImport(selectedFile);
    }
  };

  /**
   * Cierra el modal y limpia el estado.
   * 
   * Resetea el archivo seleccionado y el input file
   * antes de ejecutar el callback onClose.
   * 
   * @function
   */
  const handleCloseModal = () => {
    setSelectedFile(null);
    
    // Limpia el input file
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    
    onClose();
  };

  return (
    // Backdrop oscuro de fondo con atributos de accesibilidad
    <div className="import-modal__backdrop" role="dialog" aria-modal="true">
      
      {/* Contenedor principal del modal */}
      <div className="import-modal">
        
        {/* Cabecera con título y botón de cerrar */}
        <div className="import-modal__header">
          {/* Título del modal */}
          <div className="import-modal__title">{title}</div>
          
          {/* Botón de cerrar - se deshabilita durante carga o descarga */}
          <button 
            type="button" 
            className="import-modal__close" 
            onClick={handleCloseModal} 
            disabled={loading || isDownloading}
          >
            <RiCloseLine size={20} />
          </button>
        </div>

        {/* Subtítulo descriptivo */}
        <div className="import-modal__subtitle">{subtitle}</div>

        {/* Sección de descarga de plantilla - solo si hay URL configurada
            Renderizado condicional con && */}
        {templateUrl && (
          <div className="import-modal__template">
            {/* Botón para descargar la plantilla Excel
                Muestra "Descargando..." durante el proceso */}
            <Button
              onClick={handleDownloadTemplate}
              disabled={loading || isDownloading}
            >
              <RiDownloadLine size={18} />
              <span>{isDownloading ? 'Descargando...' : 'Descargar Plantilla'}</span>
            </Button>
          </div>
        )}

        {/* Sección de instrucciones para el usuario */}
        <div className="import-modal__instructions">
          {/* Título de la sección de instrucciones */}
          <div className="import-modal__instructions-title">Instrucciones para importar</div>
          
          {/* Lista de instrucciones */}
          <ul className="import-modal__instructions-list">
            {/* Mapea cada instrucción del array a un item de lista */}
            {instructions.map((instruction, index) => (
              <li key={index} className="import-modal__instruction-item">
                {/* Icono de check decorativo */}
                <RiCheckLine size={18} className="import-modal__check-icon" />
                
                {/* Texto de la instrucción */}
                <span>{instruction}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Zona de drag & drop para seleccionar archivo
            Clases dinámicas según estados:
            - --dragging: cuando se arrastra un archivo sobre la zona
            - --has-file: cuando ya hay un archivo seleccionado */}
        <div
          className={`import-modal__dropzone ${isDragging ? "import-modal__dropzone--dragging" : ""} ${
            selectedFile ? "import-modal__dropzone--has-file" : ""
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          // Click abre el selector de archivos solo si no hay archivo seleccionado
          onClick={() => !selectedFile && fileInputRef.current?.click()}
        >
          {/* Contenido cuando NO hay archivo seleccionado */}
          {!selectedFile ? (
            <>
              {/* Icono de archivo genérico */}
              <RiFileTextLine size={56} className="import-modal__file-icon" />
              
              {/* Texto instructivo con enlace visual */}
              <p className="import-modal__dropzone-text">
                Arrastra y suelta tu archivo aquí o{" "}
                <span className="import-modal__dropzone-link">haz clic para seleccionar</span>
              </p>
            </>
          ) : (
            /* Contenido cuando SÍ hay archivo seleccionado */
            <>
              {/* Botón para remover el archivo seleccionado
                  stopPropagation previene que se active el click del dropzone */}
              <button 
                className="import-modal__remove-btn" 
                onClick={handleRemoveFile}
                type="button"
                aria-label="Eliminar archivo"
              >
                <RiCloseLine size={18} />
              </button>
              
              {/* Icono específico de Excel */}
              <RiFileExcel2Line size={56} className="import-modal__file-icon-excel" />
              
              {/* Nombre del archivo seleccionado */}
              <p className="import-modal__file-name">{selectedFile.name}</p>
            </>
          )}

          {/* Input file oculto (se activa mediante ref al hacer click en dropzone)
              accept: limita los tipos de archivo seleccionables
              aria-label: accesibilidad para lectores de pantalla */}
          <input
            ref={fileInputRef}
            type="file"
            accept={acceptedFormats}
            onChange={handleFileInputChange}
            style={{ display: "none" }}
            aria-label="Seleccionar archivo"
          />
        </div>

        {/* Footer con botones de acción */}
        <div className="import-modal__footer">
          {/* Botón secundario para cerrar sin importar */}
          <Button 
            variant="secondary" 
            onClick={handleCloseModal} 
            disabled={loading || isDownloading}
          >
            Cerrar
          </Button>
          
          {/* Botón principal para ejecutar la importación
              Se deshabilita si: no hay archivo, está cargando o está descargando
              Muestra "Importando..." durante el proceso */}
          <Button
            variant="primary"
            onClick={handleImportClick}
            disabled={!selectedFile || loading || isDownloading}
          >
            {loading ? "Importando..." : "Importar Datos"}
          </Button>
        </div>
      </div>
    </div>
  );
}