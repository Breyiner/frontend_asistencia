// Hooks de React para estado y referencias
import { useState, useRef } from "react";

// Componentes de layout, modales y UI
import DataListLayout from "../../components/DataList/DataListLayout";
import ImportModal from "../../components/ImportModal/ImportModal";
import Button from "../../components/Button/Button";
import BadgesCompact from "../../components/BadgesCompact/BadgesCompact";

// Icono de RemixIcon para botón importar
import { RiUploadLine } from "@remixicon/react";

// Cliente API y utilidades
import { api } from "../../services/apiClient";
import { success, error } from "../../utils/alertas";

// Estilos del badge
import "../../components/Badge/Badge.css";

/**
 * Componente para listar y gestionar aprendices.
 * 
 * Proporciona tabla paginada con filtros, acciones CRUD
 * y funcionalidad de importación masiva desde Excel.
 * 
 * Características:
 * - Tabla con paginación y búsqueda
 * - Filtros básicos y avanzados
 * - Botón crear nuevo aprendiz
 * - Importación masiva con modal
 * - Badges de estado visuales
 * - Navegación a detalle por fila
 * 
 * Flujo de importación:
 * 1. Usuario abre modal de importación
 * 2. Descarga plantilla Excel (opcional)
 * 3. Selecciona archivo y confirma
 * 4. Backend procesa archivo
 * 5. Recarga automática de la lista
 * 
 * @component
 * @returns {JSX.Element} Lista completa de aprendices con funcionalidades
 */
export default function ApprenticesListPage() {
  // Estado del modal de importación
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  
  // Estado de proceso de importación en curso
  const [importing, setImporting] = useState(false);
  
  // Referencia a función de recarga de DataListLayout
  const refetchRef = useRef(null);

  /**
   * Maneja la importación masiva de aprendices desde archivo Excel.
   * 
   * Envía FormData con archivo al backend y maneja respuesta.
   * Recarga lista automáticamente si éxito.
   * 
   * @async
   * @param {File} file - Archivo Excel seleccionado por usuario
   */
  const handleImport = async (file) => {
    setImporting(true); // Inicia estado de carga

    try {
      // Crea FormData con archivo
      const formData = new FormData();
      formData.append("file", file);

      // Envía al endpoint de importación
      const res = await api.post("apprentices/import", formData);

      // Maneja error del backend
      if (!res.ok) {
        await error(res.message || "No se pudo importar el archivo.");
        return;
      }

      // Muestra éxito y cierra modal
      await success(res.message || "Aprendices importados con éxito.");
      setIsImportModalOpen(false);

      // Recarga lista automáticamente
      if (refetchRef.current) {
        refetchRef.current();
      }
    } catch (e) {
      // Maneja errores de red/inesperados
      await error(e?.message || "Error al importar. Intenta de nuevo.");
    } finally {
      // Siempre termina estado de carga
      setImporting(false);
    }
  };

  return (
    <>
      {/* Layout principal de lista de datos */}
      <DataListLayout
        title="Listado de Aprendices"
        endpoint="apprentices" // Endpoint del backend
        createPath="/apprentices/create" // Ruta para crear nuevo
        initialFilters={{ per_page: 10 }} // Filtros iniciales
        rowClickPath={(u) => `/apprentices/${u.id}`} // Navegación por fila
        onRefetchReady={(refetch) => {
          refetchRef.current = refetch; // Guarda referencia para recarga post-import
        }}
        customActions={
          /* Botón para abrir modal de importación */
          <Button variant="secondary" onClick={() => setIsImportModalOpen(true)}>
            <RiUploadLine size={18} />
            Importar
          </Button>
        }
        filtersConfig={[
          /* Filtros básicos (visibles por defecto) */
          {
            name: "first_name",
            label: "Nombres",
            placeholder: "Nombres",
            defaultValue: "",
            withSearchIcon: true,
          },
          {
            name: "last_name",
            label: "Apellidos",
            placeholder: "Apellidos",
            defaultValue: "",
          },
          /* Filtros avanzados (colapsados) */
          {
            name: "document_number",
            label: "Número de documento",
            placeholder: "Número de documento",
            advanced: true,
          },
          {
            name: "email",
            label: "Correo",
            placeholder: "Correo electrónico",
            advanced: true,
          },
          {
            name: "ficha_number",
            label: "Ficha",
            placeholder: "Ficha",
            advanced: true,
          },
          {
            name: "status_name",
            label: "Estado",
            placeholder: "Estado",
            advanced: true,
          },
        ]}
        tableColumns={[
          { key: "document_number", label: "Documento" },
          { key: "first_name", label: "Nombres" },
          { key: "last_name", label: "Apellidos" },
          { key: "email", label: "Correo" },
          { key: "ficha_number", label: "Ficha" },
          {
            /* Columna de estado con badge visual */
            key: "status",
            label: "Estado",
            render: (u) => (
              <BadgesCompact
                items={[u.status]}
                maxVisible={1}
                badgeClassName={`badge badge--${u.status === "Activo" ? "green" : "brown"}`}
              />
            ),
          },
        ]}
      />

      {/* Modal de importación masiva */}
      <ImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={handleImport}
        title="Importar Archivo"
        subtitle="Importación masiva de aprendices"
        templateUrl="apprentices/template/download" // Endpoint para descargar plantilla
        templateFileName="plantilla_aprendices.xlsx"
        loading={importing}
      />
    </>
  );
}
