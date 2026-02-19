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
import { can } from "../../utils/auth";

// Estilos del badge
import "../../components/Badge/Badge.css";

/**
 * Página principal para listar y gestionar aprendices del sistema.
 * 
 * Proporciona interfaz completa con:
 * - Tabla paginada con filtros avanzados y búsqueda
 * - Acciones CRUD condicionales por permisos Spatie
 * - Importación masiva desde Excel (Gestor/Admin)
 * - Navegación a detalle por fila
 * - Badges visuales de estado
 * 
 * Controles de acceso:
 * - apprentices.create: botón Crear + ruta createPath
 * - apprentices.import: botón Importar + modal
 * - apprentices.viewAny: acceso a la lista completa
 * 
 * Flujo de importación:
 * 1. Usuario con permiso abre modal
 * 2. Descarga plantilla (opcional)
 * 3. Sube Excel → backend procesa
 * 4. Lista se recarga automáticamente
 * 
 * @component
 * @returns {JSX.Element} Layout completo de lista de aprendices
 */
export default function ApprenticesListPage() {
  /**
   * Verificaciones de permisos Spatie para acciones específicas.
   * Determinan visibilidad de botones y funcionalidades.
   */
  const canImport = can("apprentices.import");
  const canCreate = can("apprentices.create");

  /**
   * Estados locales del componente.
   */
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importing, setImporting] = useState(false);
  const refetchRef = useRef(null);

  /**
   * Ruta dinámica para botón Crear según permiso.
   * null oculta botón nativo de DataListLayout.
   */
  const createPath = canCreate ? "/apprentices/create" : null;

  /**
   * Handler para importación masiva desde Excel.
   * 
   * Proceso:
   * 1. FormData con archivo → POST /apprentices/import
   * 2. Manejo de errores backend/network
   * 3. Feedback con alertas + recarga automática
   * 
   * @async
   * @param {File} file - Archivo Excel seleccionado
   */
  const handleImport = async (file) => {
    setImporting(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await api.post("apprentices/import", formData);

      if (!res.ok) {
        await error(res.message || "No se pudo importar el archivo.");
        return;
      }

      await success(res.message || "Aprendices importados con éxito.");
      setIsImportModalOpen(false);

      if (refetchRef.current) {
        refetchRef.current();
      }
    } catch (e) {
      await error(e?.message || "Error al importar. Intenta de nuevo.");
    } finally {
      setImporting(false);
    }
  };

  return (
    <>
      {/* Layout principal con tabla paginada y filtros */}
      <DataListLayout
        title="Listado de Aprendices"
        endpoint="apprentices"
        createPath={createPath}
        initialFilters={{ per_page: 10 }}
        rowClickPath={(u) => `/apprentices/${u.id}`}
        onRefetchReady={(refetch) => {
          refetchRef.current = refetch;
        }}
        customActions={
          <>
            {canImport && (
              /* Botón Importar - Solo Gestor/Admin */
              <Button variant="secondary" onClick={() => setIsImportModalOpen(true)}>
                <RiUploadLine size={18} />
                Importar
              </Button>
            )}
            {canCreate && (
              /* Botón Crear - Gestor/Admin (+Coordinador si agregas permiso) */
              <Button variant="primary" href="/apprentices/create">
                Crear Aprendiz
              </Button>
            )}
          </>
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
          /* Filtros avanzados (colapsables) */
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

      {/* Modal de importación - Solo renderiza si tiene permiso */}
      {canImport && (
        <ImportModal
          isOpen={isImportModalOpen}
          onClose={() => setIsImportModalOpen(false)}
          onImport={handleImport}
          title="Importar Archivo"
          subtitle="Importación masiva de aprendices"
          templateUrl="apprentices/template/download"
          templateFileName="plantilla_aprendices.xlsx"
          loading={importing}
        />
      )}
    </>
  );
}
