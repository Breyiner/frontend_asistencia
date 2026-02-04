import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";

import UserLayout from "../../components/UserLayout/UserLayout";
import BlocksGrid from "../../components/Blocks/BlocksGrid";
import InfoRow from "../../components/InfoRow/InfoRow";
import InputField from "../../components/InputField/InputField";
import Button from "../../components/Button/Button";

import useCatalog from "../../hooks/useCatalog";
import useNoClassDayShow from "../../hooks/useNoClassDayShow";

import { weekdayEs } from "../../utils/dateFormat";

import "./NoClassDayShowPage.css";

export default function NoClassDayShowPage() {
  const { noClassDayId } = useParams();
  const navigate = useNavigate();

  const {
    noClassDay,
    loading,
    isEditing,
    form,
    errors,
    saving,
    startEdit,
    cancelEdit,
    onChange,
    save,
    deleteNoClassDay,
  } = useNoClassDayShow(noClassDayId);

  const fichasCatalog = useCatalog("fichas");
  const reasonsCatalog = useCatalog("no_class_reasons");

  const dayLabel = useMemo(() => {
    const w = weekdayEs(noClassDay?.date);
    if (!w) return "";
    return w.charAt(0).toUpperCase() + w.slice(1);
  }, [noClassDay?.date]);

  const title = useMemo(() => {
    const date = noClassDay?.date || "—";
    return `Día sin clase - ${dayLabel ? `${dayLabel} ` : ""}${date}`;
  }, [noClassDay?.date, dayLabel]);

  const actions = useMemo(() => {
    if (!noClassDay) return null;

    return isEditing ? (
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
        <Button variant="primary" onClick={startEdit} disabled={saving}>
          Editar
        </Button>
        <Button variant="danger" onClick={deleteNoClassDay} disabled={saving}>
          Eliminar
        </Button>
      </>
    );
  }, [noClassDay, isEditing, saving, cancelEdit, save, startEdit, deleteNoClassDay]);

  const sections = useMemo(() => {
    if (!noClassDay) return [];

    return [
      {
        left: [
          {
            title: "",
            content: (
              <>
                <div className="header-no-class-day">
                  <div className="header-no-class-day__container-title">
                    <span className="header-no-class-day__title">{title}</span>
                    <div className="header-no-class-day__content">
                      {noClassDay.training_program_name || "—"}
                    </div>
                    <div className="header-no-class-day__content">
                      Ficha {noClassDay.ficha_number || "—"}
                    </div>
                  </div>
                </div>
              </>
            ),
          },
        ],
      },
      {
        left: [
          {
            title: "",
            content: (
              <>
                {isEditing ? (
                  <>
                    <InputField
                      label="Ficha"
                      name="ficha_id"
                      value={form.ficha_id}
                      onChange={onChange}
                      options={fichasCatalog.options}
                      disabled={fichasCatalog.loading || saving}
                      error={errors.ficha_id}
                      select
                    />

                    <InputField
                      label="Fecha"
                      name="date"
                      type="date"
                      value={form.date}
                      onChange={onChange}
                      disabled={saving}
                      error={errors.date}
                    />

                    <InputField
                      label="Motivo"
                      name="reason_id"
                      value={form.reason_id}
                      onChange={onChange}
                      options={reasonsCatalog.options}
                      disabled={reasonsCatalog.loading || saving}
                      error={errors.reason_id}
                      select
                    />

                    <InputField
                      label="Observaciones"
                      name="observations"
                      textarea
                      value={form.observations}
                      onChange={onChange}
                      disabled={saving}
                      error={errors.observations}
                    />
                  </>
                ) : (
                  <>
                    <InfoRow
                      label="Fecha"
                      value={
                        noClassDay.date
                          ? `${noClassDay.date} - ${dayLabel || "—"}`
                          : "—"
                      }
                    />
                    <InfoRow label="Motivo" value={noClassDay.reason_name || "—"} />
                    <InfoRow
                      label="Descripción del motivo"
                      value={noClassDay.reason_description || "—"}
                    />

                    {noClassDay.observations ? (
                      <InfoRow label="Observaciones" value={noClassDay.observations} />
                    ) : null}
                  </>
                )}
              </>
            ),
          },
        ],

        right: [
          {
            title: "",
            content: (
              <>
                <InfoRow label="Ficha" value={noClassDay.ficha_number || "—"} />
                <InfoRow
                  label="Programa"
                  value={noClassDay.training_program_name || "—"}
                />
                <InfoRow label="Jornada" value={noClassDay.shift_name || "—"} />
                <InfoRow
                  label="Gestor"
                  value={noClassDay.gestor_name || "Sin gestor"}
                />
              </>
            ),
          },
        ],
      },
    ];
  }, [
    noClassDay,
    title,
    dayLabel,
    isEditing,
    form,
    errors,
    onChange,
    saving,
    fichasCatalog.options,
    fichasCatalog.loading,
    reasonsCatalog.options,
    reasonsCatalog.loading,
  ]);

  const side = useMemo(() => {
    if (!noClassDay || isEditing) {
      return [
        {
          title: "Nota",
          variant: "info",
          content: <p>Los cambios se guardarán automáticamente en el sistema</p>,
        },
      ];
    }

    return [
      {
        title: "Información Adicional",
        variant: "default",
        content: (
          <>
            <InfoRow label="ID" value={noClassDay.id} />
            <InfoRow label="Fecha de registro" value={noClassDay.created_at || "—"} />
            <InfoRow
              label="Última actualización"
              value={noClassDay.updated_at || "—"}
            />
          </>
        ),
      },
      {
        title: "Nota",
        variant: "info",
        content: (
          <p>
            Los días sin clase afectan el cálculo de asistencias y no se contabilizan
            como ausencias para los aprendices.
          </p>
        ),
      },
    ];
  }, [noClassDay, isEditing]);

  if (loading) return <div>Cargando...</div>;
  if (!noClassDay) return <div>Día sin clase no encontrado</div>;

  return (
    <div className="no-class-day-show">
      <UserLayout onBack={() => navigate("/no_class_days")} actions={actions}>
        <BlocksGrid sections={sections} side={side} />
      </UserLayout>
    </div>
  );
}