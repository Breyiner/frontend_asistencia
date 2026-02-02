import { useState, useRef } from "react";
import DataListLayout from "../../components/DataList/DataListLayout";
import ImportModal from "../../components/ImportModal/ImportModal";
import Button from "../../components/Button/Button";
import BadgesCompact from "../../components/BadgesCompact/BadgesCompact";
import { RiUploadLine } from "@remixicon/react";
import { api } from "../../services/apiClient";
import { success, error } from "../../utils/alertas";
import "../../components/Badge/Badge.css";

export default function ApprenticesListPage() {
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importing, setImporting] = useState(false);
  const refetchRef = useRef(null);

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
      <DataListLayout
        title="Listado de Aprendices"
        endpoint="apprentices"
        createPath="/apprentices/create"
        initialFilters={{ per_page: 10 }}
        rowClickPath={(u) => `/apprentices/${u.id}`}
        onRefetchReady={(refetch) => {
          refetchRef.current = refetch;
        }}
        customActions={
          <Button variant="secondary" onClick={() => setIsImportModalOpen(true)}>
            <RiUploadLine size={18} />
            Importar
          </Button>
        }
        filtersConfig={[
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
    </>
  );
}