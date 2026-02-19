import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";

import UserLayout  from "../../components/UserLayout/UserLayout";
import BlocksGrid  from "../../components/Blocks/BlocksGrid";
import InfoRow     from "../../components/InfoRow/InfoRow";
import InputField  from "../../components/InputField/InputField";
import Button      from "../../components/Button/Button";

import { can } from "../../utils/auth";
import useDocumentTypeShow from "../../hooks/useDocumentTypeShow";

/**
 * Página de visualización y edición de un tipo de documento específico.
 *
 * Permisos Spatie:
 * - document_types.view:   acceso a vista lectura
 * - document_types.update: botón Editar + modo edición
 * - document_types.delete: botón Eliminar
 *
 * @component
 * @returns {JSX.Element}
 */
export default function DocumentTypeShowPage() {
  const { documentTypeId } = useParams();
  const navigate = useNavigate();

  const canUpdate = can("document_types.update");
  const canDelete = can("document_types.delete");

  const {
    documentType,
    loading,
    notFound,
    isEditing,
    form,
    errors,
    saving,
    startEdit,
    cancelEdit,
    onChange,
    save,
    deleteDocumentType,
  } = useDocumentTypeShow(documentTypeId);

  const sections = useMemo(
    () => [
      {
        left: [
          {
            title: "Información Principal",
            content: isEditing ? (
              <InputField
                label="Nombre *"
                name="name"
                value={form.name}
                onChange={onChange}
                error={errors.name}
                disabled={saving}
                required
              />
            ) : (
              <InfoRow label="Nombre" value={documentType?.name} />
            ),
          },
        ],
        right: [
          {
            title: "Sigla",
            content: isEditing ? (
              <InputField
                label="Sigla *"
                name="acronym"
                value={form.acronym}
                onChange={onChange}
                error={errors.acronym}
                disabled={saving}
                required
              />
            ) : (
              <InfoRow label="Sigla" value={documentType?.acronym} />
            ),
          },
        ],
      },
    ],
    [isEditing, form, errors, onChange, documentType, saving]
  );

  const side = useMemo(
    () =>
      [
        !isEditing && documentType
          ? {
              title: "Información del Sistema",
              variant: "default",
              content: (
                <>
                  <InfoRow label="ID"                    value={documentType.id} />
                  <InfoRow label="Fecha de creación"     value={documentType.created_at} />
                  <InfoRow label="Última actualización"  value={documentType.updated_at} />
                </>
              ),
            }
          : null,
        {
          title: "Nota",
          variant: "info",
          content: (
            <p>Los cambios se guardan al hacer clic en "Guardar".</p>
          ),
        },
      ].filter(Boolean),
    [isEditing, documentType]
  );

  const actions = useMemo(
    () =>
      isEditing ? (
        <>
          <Button variant="secondary" onClick={cancelEdit} disabled={saving}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={save} disabled={saving}>
            {saving ? "Guardando..." : "Guardar Cambios"}
          </Button>
        </>
      ) : (
        <>
          {canUpdate && (
            <Button variant="primary" onClick={startEdit} disabled={saving}>
              Editar
            </Button>
          )}
          {canDelete && (
            <Button variant="danger" onClick={deleteDocumentType} disabled={saving}>
              Eliminar Tipo de Documento
            </Button>
          )}
        </>
      ),
    [isEditing, saving, cancelEdit, save, startEdit, deleteDocumentType, canUpdate, canDelete]
  );

  if (loading)      return <div className="loading">Cargando tipo de documento...</div>;
  if (notFound)     return <div className="not-found">Tipo de documento no encontrado</div>;
  if (!documentType) return null;

  return (
    <div className="document-type-show">
      <UserLayout
        onBack={() => navigate("/document_types")}
        actions={actions}
        title={`${documentType.name} (${documentType.acronym})`}
      >
        <BlocksGrid sections={sections} side={side} />
      </UserLayout>
    </div>
  );
}