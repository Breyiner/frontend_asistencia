import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";

import UserLayout from "../../components/UserLayout/UserLayout";
import BlocksGrid from "../../components/Blocks/BlocksGrid";
import InfoRow from "../../components/InfoRow/InfoRow";
import InputField from "../../components/InputField/InputField";
import Button from "../../components/Button/Button";

import useCatalog from "../../hooks/useCatalog";
import useFichaShow from "../../hooks/useFichaShow";
import TrimestresList from "../../components/TermList/TermList";
import { can, getCurrentRoleCode } from "../../utils/auth";

export default function FichaShowPage() {
  const canUpdate = can("fichas.update");
  const canDelete = can("fichas.delete");
  const canCreateTerms = can("ficha_terms.create");
  const canManageTerms = can("ficha_terms.setCurrent");
  const canEditTerms = can("ficha_terms.update");
  const canDeleteTerms = can("ficha_terms.delete");
  const roleCode = getCurrentRoleCode();

  const { fichaId } = useParams();
  const navigate = useNavigate();

  const {
    ficha,
    loading,
    isEditing,
    form,
    errors,
    saving,
    startEdit,
    cancelEdit,
    onChange,
    save,
    deleteFicha,
    setCurrentTerm,
    deleteFichaTerm,
  } = useFichaShow(fichaId);

  const programsCatalog = useCatalog("training_programs");
  const gestorsCatalog = useCatalog("users/role/2");
  const statusCatalog = useCatalog("ficha_statuses");
  const shiftsCatalog = useCatalog("shifts");

  const sections = useMemo(
    () =>
      [
        {
          left: [
            {
              title: "Información de la Ficha",
              content: isEditing ? (
                <>
                  <InputField
                    label="Número de Ficha"
                    name="ficha_number"
                    value={form.ficha_number}
                    onChange={onChange}
                    error={errors.ficha_number}
                    disabled={saving}
                  />
                  <InputField
                    label="Programa"
                    name="training_program_id"
                    value={form.training_program_id}
                    onChange={onChange}
                    options={programsCatalog.options}
                    disabled={programsCatalog.loading || saving}
                    error={errors.training_program_id}
                    select
                  />
                  {/* Gestor: solo admin puede cambiar, gestor ve su nombre fijo */}
                  {roleCode === "ADMIN" ? (
                    <InputField
                      label="Gestor"
                      name="gestor_id"
                      value={form.gestor_id}
                      onChange={onChange}
                      options={gestorsCatalog.options}
                      disabled={gestorsCatalog.loading || saving}
                      error={errors.gestor_id}
                      select
                    />
                  ) : <></>
                  }
                  <InputField
                    label="Jornada"
                    name="shift_id"
                    value={form.shift_id}
                    onChange={onChange}
                    options={shiftsCatalog.options}
                    disabled={shiftsCatalog.loading || saving}
                    error={errors.shift_id}
                    select
                  />
                </>
              ) : (
                <>
                  <InfoRow label="Número de Ficha" value={ficha?.ficha_number} />
                  <InfoRow label="Programa" value={ficha?.training_program_name} />
                  <InfoRow label="Gestor" value={ficha?.gestor_name} />
                  <InfoRow label="Jornada" value={ficha?.shift_name} />
                </>
              ),
            },
          ],
          right: [
            {
              title: "Fechas y Estado",
              content: isEditing ? (
                <>
                  <InputField
                    label="Fecha Inicio"
                    name="start_date"
                    type="date"
                    value={form.start_date}
                    onChange={onChange}
                    error={errors.start_date}
                    disabled={saving}
                  />
                  <InputField
                    label="Fecha Fin"
                    name="end_date"
                    type="date"
                    value={form.end_date}
                    onChange={onChange}
                    error={errors.end_date}
                    disabled={saving}
                  />
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
                  <InfoRow label="Fecha Inicio" value={ficha?.start_date} />
                  <InfoRow label="Fecha Fin" value={ficha?.end_date} />
                  <InfoRow label="Estado" value={ficha?.status_name} />
                </>
              ),
            },
          ],
        },

        !isEditing
          ? {
              left: [
                {
                  title: "",
                  content: (
                    <TrimestresList
                      trimestres={ficha?.ficha_terms || []}
                      currentId={ficha?.current_ficha_term_id}
                      associateTo={canCreateTerms ? `/fichas/${fichaId}/ficha_terms/create` : null}
                      onEdit={canEditTerms ? (t) => navigate(`/fichas/${fichaId}/ficha_terms/${t.id}/update`) : null}
                      onDelete={canDeleteTerms ? (t) => deleteFichaTerm(t.id) : null}
                      onSetCurrent={canManageTerms ? (t) => setCurrentTerm(t.id) : null}
                      showSchedule={true}
                      onOpenSchedule={(t) => navigate(`/fichas/${fichaId}/ficha_terms/${t.id}/schedule`)}
                    />
                  ),
                },
              ],
            }
          : null,
      ].filter(Boolean),
    [
      fichaId,
      isEditing,
      form,
      errors,
      onChange,
      ficha,
      programsCatalog.options,
      programsCatalog.loading,
      gestorsCatalog.options,
      gestorsCatalog.loading,
      statusCatalog.options,
      statusCatalog.loading,
      saving,
      navigate,
      deleteFichaTerm,
      setCurrentTerm,
      canManageTerms,
      roleCode,
    ]
  );

  const side = useMemo(
    () =>
      [
        !isEditing && ficha
          ? {
              title: "Estadísticas",
              variant: "default",
              content: (
                <>
                  <InfoRow label="Total Aprendices" value={ficha.apprentices_count} />
                </>
              ),
            }
          : null,

        !isEditing && ficha
          ? {
              title: "Información Sistema",
              variant: "default",
              content: (
                <>
                  <InfoRow label="ID" value={ficha.id} />
                  <InfoRow label="Fecha registro" value={ficha.created_at} />
                  <InfoRow label="Fecha Actualización" value={ficha.updated_at} />
                  <InfoRow label="Trimestre Actual" value={ficha.current_term_name || "Ninguno"} />
                </>
              ),
            }
          : null,

        {
          title: "Nota",
          variant: "info",
          content: <p>Los cambios se guardarán automáticamente</p>,
        },
      ].filter(Boolean),
    [isEditing, ficha]
  );

  const actions = useMemo(
    () =>
      isEditing ? (
        <>
          {canUpdate && (
            <>
              <Button variant="secondary" onClick={cancelEdit} disabled={saving}>
                Cancelar
              </Button>
              <Button variant="primary" onClick={save} disabled={saving}>
                {saving ? "Guardando..." : "Guardar"}
              </Button>
            </>
          )}
        </>
      ) : (
        <>
          {canUpdate && (
            <Button variant="primary" onClick={startEdit} disabled={saving}>
              Editar
            </Button>
          )}
          {canDelete && (
            <Button variant="danger" onClick={deleteFicha} disabled={saving}>
              Eliminar
            </Button>
          )}
        </>
      ),
    [isEditing, saving, cancelEdit, save, startEdit, deleteFicha, canUpdate, canDelete]
  );

  if (loading) return <div>Cargando...</div>;
  if (!ficha) return <div>Ficha no encontrada</div>;

  return (
    <div className="ficha-show">
      <UserLayout onBack={() => navigate("/fichas")} actions={actions}>
        <BlocksGrid sections={sections} side={side} />
      </UserLayout>
    </div>
  );
}