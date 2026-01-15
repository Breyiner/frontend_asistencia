import { useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";

import UserLayout from "../../components/UserLayout/UserLayout";
import BlocksGrid from "../../components/Blocks/BlocksGrid";
import InfoRow from "../../components/InfoRow/InfoRow";
import InputField from "../../components/InputField/InputField";
import Button from "../../components/Button/Button";

import useApprenticeShow from "../../hooks/useApprenticeShow";
import useCatalog from "../../hooks/useCatalog";

function yesterdayYmd() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

export default function ApprenticesShowPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const {
    apprentice,
    loading,
    isEditing,
    form,
    errors,
    saving,
    startEdit,
    cancelEdit,
    onChange,
    save,
    deleteApprentice,
    setRolesCatalog,
  } = useApprenticeShow(id);

  const rolesCatalog = useCatalog("roles", { includeEmpty: false });
  const statusCatalog = useCatalog("user_statuses");
  const docTypesCatalog = useCatalog("document_types");

  useEffect(() => {
    if (setRolesCatalog) setRolesCatalog(rolesCatalog.options);
  }, [rolesCatalog.options, setRolesCatalog]);

  const left = useMemo(
    () => [
      {
        title: "Información Personal",
        content: isEditing ? (
          <>
            <InputField label="Nombres" name="first_name" value={form.first_name} onChange={onChange} error={errors.first_name} disabled={saving} />
            <InputField label="Apellidos" name="last_name" value={form.last_name} onChange={onChange} error={errors.last_name} disabled={saving} />

            <InputField
              label="Tipo de Documento"
              name="document_type_id"
              value={form.document_type_id}
              onChange={onChange}
              options={docTypesCatalog.options}
              disabled={docTypesCatalog.loading || saving}
              error={errors.document_type_id}
              select
            />

            <InputField label="Documento" name="document_number" value={form.document_number} onChange={onChange} error={errors.document_number} disabled={saving} />
            <InputField label="Correo" name="email" value={form.email} onChange={onChange} error={errors.email} disabled={saving} />
            <InputField label="Teléfono" name="telephone_number" value={form.telephone_number} onChange={onChange} error={errors.telephone_number} disabled={saving} />

            <InputField
              label="Fecha de nacimiento"
              name="birth_date"
              type="date"
              value={form.birth_date}
              onChange={onChange}
              error={errors.birth_date}
              disabled={saving}
              max={yesterdayYmd()}
            />
          </>
        ) : (
          <>
            <InfoRow label="Nombres" value={apprentice?.first_name} />
            <InfoRow label="Apellidos" value={apprentice?.last_name} />
            <InfoRow label="Tipo de Documento" value={apprentice?.document_type_name} />
            <InfoRow label="Documento" value={apprentice?.document_number} />
            <InfoRow label="Correo" value={apprentice?.email} />
            <InfoRow label="Teléfono" value={apprentice?.telephone_number} />
            <InfoRow label="Fecha de nacimiento" value={apprentice?.birth_date} />
          </>
        ),
      },
    ],
    [isEditing, form, errors, onChange, apprentice, docTypesCatalog.options, docTypesCatalog.loading, saving]
  );

  const right = useMemo(
    () => [
      {
        title: "Información Sistema",
        content: isEditing ? (
          <>
            <InputField
              label="Estado"
              name="status_id"
              value={form.status_id}
              onChange={onChange}
              options={statusCatalog.options}
              disabled={statusCatalog.loading || saving}
              error={errors.status_id}
              select
            />
          </>
        ) : (
          <>
            <InfoRow label="Rol" value={Array.isArray(apprentice?.roles) ? apprentice.roles.join(", ") : apprentice?.roles} />
            <InfoRow label="Estado" value={apprentice?.status} />
            <InfoRow label="Programa de Formación" value={apprentice?.training_program} />
            <InfoRow label="Ficha" value={apprentice?.ficha_number} />
          </>
        ),
      },
    ],
    [isEditing, form.status_id, errors, onChange, apprentice, statusCatalog.options, statusCatalog.loading, saving]
  );

  const side = useMemo(
    () =>
      [
        !isEditing && apprentice
          ? {
              title: "Información Adicional",
              variant: "default",
              content: (
                <>
                  <InfoRow label="ID" value={apprentice.id} />
                  <InfoRow label="Fecha registro" value={apprentice.created_at} />
                  <InfoRow label="Última actualización" value={apprentice.updated_at} />
                </>
              ),
            }
          : null,
        {
          title: "Nota",
          variant: "info",
          content: <p>Los cambios realizados se guardarán automáticamente en el sistema</p>,
        },
      ].filter(Boolean),
    [isEditing, apprentice]
  );

  const actions = useMemo(
    () =>
      isEditing ? (
        <>
          <Button variant="secondary" onClick={cancelEdit} disabled={saving}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={save} disabled={saving}>
            {saving ? "Guardando..." : "Guardar"}
          </Button>
        </>
      ) : (
        <>
          <Button variant="primary" onClick={startEdit}>
            Editar
          </Button>
          <Button variant="danger" onClick={deleteApprentice}>
            Eliminar
          </Button>
        </>
      ),
    [isEditing, saving, cancelEdit, save, startEdit, deleteApprentice]
  );

  if (loading) return <div>Cargando...</div>;
  if (!apprentice) return <div>No encontrado</div>;

  return (
    <div className="apprentice-show">
      <UserLayout onBack={() => navigate("/apprentices")} actions={actions}>
        <BlocksGrid left={left} right={right} side={side} />
      </UserLayout>
    </div>
  );
}