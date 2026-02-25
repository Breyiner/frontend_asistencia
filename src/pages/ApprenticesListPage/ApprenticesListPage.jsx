// pages/ApprenticesListPage.jsx

// ─── React ────────────────────────────────────────────────────────────────────
import { useRef } from "react";

// ─── Componentes de layout y UI ───────────────────────────────────────────────
import DataListLayout   from "../../components/DataList/DataListLayout";
import ImportModal      from "../../components/ImportModal/ImportModal";
import ImportErrorModal from "../../components/ImportErrorModal/ImportErrorModal";
import Button           from "../../components/Button/Button";
import BadgesCompact    from "../../components/BadgesCompact/BadgesCompact";

// ─── Iconos ───────────────────────────────────────────────────────────────────
import { RiUploadLine } from "@remixicon/react";

// ─── Utilidades ───────────────────────────────────────────────────────────────
import { can } from "../../utils/auth";

// ─── Hook de importación ──────────────────────────────────────────────────────
// Centraliza toda la lógica:
// · Estado y handlers de ImportModal e ImportErrorModal
// · POST apprentices/import + detección de errorKey del backend
// · GET apprentices/import/errors-excel → blob → descarga automática
import { useImportApprentices } from "../../hooks/useImportApprentices";

// ─── Estilos ──────────────────────────────────────────────────────────────────
import "../../components/Badge/Badge.css";


/**
 * Página principal para listar y gestionar aprendices del sistema.
 *
 * ── Responsabilidades de esta página ─────────────────────────────────────────
 * · Renderizar la tabla paginada con filtros (DataListLayout)
 * · Mostrar botón "Importar" si el usuario tiene permiso apprentices.import
 * · Mostrar botón "Crear" si el usuario tiene permiso apprentices.create
 * · Coordinar los dos modales del flujo de importación:
 *     1. ImportModal      → selección y subida del archivo Excel
 *     2. ImportErrorModal → listado de filas rechazadas + descarga Excel errores
 *
 * ── Lo que esta página NO hace (delegado al hook) ─────────────────────────────
 * · Lógica de peticiones HTTP (api.post / api.downloadFile)
 * · Manejo de estados de carga (importing, downloadingErrors)
 * · Detección del errorKey "import_apprentices_failed"
 * · Generación del blob y descarga automática del Excel de errores
 *
 * ── Flujo de importación ──────────────────────────────────────────────────────
 * 1. Usuario hace clic en "Importar" → abre ImportModal
 * 2. Selecciona archivo Excel y confirma → handleImport()
 *    a. Éxito total     → alerta success + refresca tabla automáticamente
 *    b. Filas rechazadas→ cierra ImportModal, abre ImportErrorModal con errores
 *    c. Error genérico  → alerta de error (red, timeout, validación)
 * 3. Desde ImportErrorModal el usuario puede:
 *    · Ver el listado de filas con sus mensajes de error
 *    · Descargar Excel de errores (mismo formato plantilla + columna roja)
 *
 * @component
 * @returns {JSX.Element} Layout completo de lista de aprendices
 */
export default function ApprenticesListPage() {
  // Permisos del rol activo del usuario autenticado
  const canImport = can("apprentices.import");
  const canCreate = can("apprentices.create");

  // Destructura estados y handlers del hook de importación
  const {
    // ── ImportModal ──────────────────────────────────────────────────────────
    isImportModalOpen, // boolean: controla visibilidad del ImportModal
    importing,         // boolean: true mientras POST apprentices/import está en curso
    openImportModal,   // () => void: abre el ImportModal
    closeImportModal,  // () => void: cierra el ImportModal
    handleImport,      // (file: File) => void: ejecuta la importación

    // ── ImportErrorModal ─────────────────────────────────────────────────────
    isErrorModalOpen,      // boolean: controla visibilidad del ImportErrorModal
    importErrorData,       // { message, errors[] } | null: datos de errores del backend
    downloadingErrors,     // boolean: true mientras GET errors-excel está en curso
    handleCloseErrorModal, // () => void: cierra modal y limpia importErrorData
    handleDownloadErrors,  // () => void: descarga Excel de errores desde el backend

    // ── Tabla ────────────────────────────────────────────────────────────────
    refetchRef, // React.MutableRefObject: ref para disparar refetch de la tabla
  } = useImportApprentices();


  return (
    <>
      {/*
       * DataListLayout: tabla paginada con filtros y acciones.
       *
       * · endpoint      → GET /api/apprentices (con query params de filtros)
       * · createPath    → ruta del botón "Crear" (null si sin permiso)
       * · onRefetchReady→ recibe la función refetch y la guarda en refetchRef
       *                   para poder llamarla tras una importación exitosa
       * · customActions → botón "Importar" condicionado al permiso
       * · filtersConfig → filtros básicos y avanzados de la tabla
       * · tableColumns  → columnas con sus keys y renders personalizados
       */}
      <DataListLayout
        title="Listado de Aprendices"
        endpoint="apprentices"
        createPath={canCreate ? "/apprentices/create" : null}
        initialFilters={{ per_page: 10 }}
        rowClickPath={(u) => `/apprentices/${u.id}`}
        onRefetchReady={(refetch) => { refetchRef.current = refetch; }}
        customActions={
          // Solo renderiza el botón si el usuario tiene permiso de importar
          canImport && (
            <Button variant="secondary" onClick={openImportModal}>
              <RiUploadLine size={18} />
              Importar
            </Button>
          )
        }
        filtersConfig={[
          { name: "first_name",      label: "Nombres",             placeholder: "Nombres",             defaultValue: "", withSearchIcon: true },
          { name: "last_name",       label: "Apellidos",           placeholder: "Apellidos",           defaultValue: "" },
          { name: "document_number", label: "Número de documento", placeholder: "Número de documento", advanced: true },
          { name: "email",           label: "Correo",              placeholder: "Correo electrónico",  advanced: true },
          { name: "ficha_number",    label: "Ficha",               placeholder: "Ficha",               advanced: true },
          { name: "status_name",     label: "Estado",              placeholder: "Estado",              advanced: true },
        ]}
        tableColumns={[
          { key: "document_number", label: "Documento" },
          { key: "first_name",      label: "Nombres" },
          { key: "last_name",       label: "Apellidos" },
          { key: "email",           label: "Correo" },
          { key: "ficha_number",    label: "Ficha" },
          {
            key: "status",
            label: "Estado",
            // Render personalizado: badge verde (Activo) o marrón (otros estados)
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

      {/*
       * ImportModal: primer paso del flujo de importación.
       *
       * · Solo se monta si el usuario tiene permiso de importar
       * · templateUrl → endpoint para descargar la plantilla Excel vacía
       * · loading     → deshabilita controles mientras se procesa el import
       * · onImport    → recibe el File y llama a handleImport del hook
       */}
      {canImport && (
        <ImportModal
          isOpen={isImportModalOpen}
          onClose={closeImportModal}
          onImport={handleImport}
          title="Importar Archivo"
          subtitle="Importación masiva de aprendices"
          templateUrl="apprentices/template/download"
          templateFileName="plantilla_aprendices.xlsx"
          loading={importing}
        />
      )}

      {/*
       * ImportErrorModal: segundo paso, solo cuando hay filas rechazadas.
       *
       * · Se abre automáticamente cuando el backend responde con:
       *   errorKey = "import_apprentices_failed"
       * · errorData.errors → [{fila, errores[], valores}] del backend
       * · onDownloadErrors → GET apprentices/import/errors-excel → blob → .xlsx
       *   (el backend lee el caché de 10 min y genera el Excel con estilos)
       * · No necesita canImport: si llegaste aquí ya tienes permiso
       */}
      <ImportErrorModal
        isOpen={isErrorModalOpen}
        onClose={handleCloseErrorModal}
        errorData={importErrorData}
        onDownloadErrors={handleDownloadErrors}
        downloadingErrors={downloadingErrors}
      />
    </>
  );
}
