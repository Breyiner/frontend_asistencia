import { useState, useRef } from "react";
import { 
  RiCloseLine,
  RiDownloadLine, 
  RiCheckLine, 
  RiFileTextLine, 
  RiFileExcel2Line
} from "@remixicon/react";
import Button from "../Button/Button";
import { useTemplateDownload } from "../../hooks/useTemplateDownload";
import "./ImportModal.css";
import { error } from "../../utils/alertas";

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
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);
  
  const { downloadTemplate, isDownloading, error: downloadError } = useTemplateDownload();

  if (!isOpen) return null;

  const handleDownloadTemplate = async () => {
    const success = await downloadTemplate(templateUrl, templateFileName);
    if (!success) {
      error('Error al descargar la plantilla. Por favor intenta nuevamente.');
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelection(files[0]);
    }
  };

  const handleFileSelection = (file) => {
    const extension = file.name.split(".").pop().toLowerCase();
    if (extension === "xlsx" || extension === "xls") {
      setSelectedFile(file);
    } else {
      alert("Por favor selecciona un archivo Excel (.xlsx o .xls)");
    }
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFileSelection(file);
    }
  };

  const handleRemoveFile = (e) => {
    e.stopPropagation();
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleImportClick = () => {
    if (selectedFile) {
      onImport(selectedFile);
    }
  };

  const handleCloseModal = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onClose();
  };

  return (
    <div className="import-modal__backdrop" role="dialog" aria-modal="true">
      <div className="import-modal">
        <div className="import-modal__header">
          <div className="import-modal__title">{title}</div>
          <button 
            type="button" 
            className="import-modal__close" 
            onClick={handleCloseModal} 
            disabled={loading || isDownloading}
          >
            <RiCloseLine size={20} />
          </button>
        </div>

        <div className="import-modal__subtitle">{subtitle}</div>

        {templateUrl && (
          <div className="import-modal__template">
            <Button
              onClick={handleDownloadTemplate}
              disabled={loading || isDownloading}
            >
              <RiDownloadLine size={18} />
              <span>{isDownloading ? 'Descargando...' : 'Descargar Plantilla'}</span>
            </Button>
          </div>
        )}

        <div className="import-modal__instructions">
          <div className="import-modal__instructions-title">Instrucciones para importar</div>
          <ul className="import-modal__instructions-list">
            {instructions.map((instruction, index) => (
              <li key={index} className="import-modal__instruction-item">
                <RiCheckLine size={18} className="import-modal__check-icon" />
                <span>{instruction}</span>
              </li>
            ))}
          </ul>
        </div>

        <div
          className={`import-modal__dropzone ${isDragging ? "import-modal__dropzone--dragging" : ""} ${
            selectedFile ? "import-modal__dropzone--has-file" : ""
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !selectedFile && fileInputRef.current?.click()}
        >
          {!selectedFile ? (
            <>
              <RiFileTextLine size={56} className="import-modal__file-icon" />
              <p className="import-modal__dropzone-text">
                Arrastra y suelta tu archivo aquí o{" "}
                <span className="import-modal__dropzone-link">haz clic para seleccionar</span>
              </p>
            </>
          ) : (
            <>
              <button 
                className="import-modal__remove-btn" 
                onClick={handleRemoveFile}
                type="button"
                aria-label="Eliminar archivo"
              >
                <RiCloseLine size={18} />
              </button>
              <RiFileExcel2Line size={56} className="import-modal__file-icon-excel" />
              <p className="import-modal__file-name">{selectedFile.name}</p>
            </>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept={acceptedFormats}
            onChange={handleFileInputChange}
            style={{ display: "none" }}
            aria-label="Seleccionar archivo"
          />
        </div>

        <div className="import-modal__footer">
          <Button 
            variant="secondary" 
            onClick={handleCloseModal} 
            disabled={loading || isDownloading}
          >
            Cerrar
          </Button>
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