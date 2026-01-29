import { useNavigate } from "react-router-dom";

import UserLayout from "../../components/UserLayout/UserLayout";
import BlocksGrid from "../../components/Blocks/BlocksGrid";
import InputField from "../../components/InputField/InputField";
import Button from "../../components/Button/Button";
import InfoRow from "../../components/InfoRow/InfoRow";

import useCatalog from "../../hooks/useCatalog";
import useSessionScheduleUpdate from "../../hooks/useSessionScheduleUpdate";

export default function SessionScheduleUpdatePage() {
  const navigate = useNavigate();

  const {
    fichaId,
    fichaTermId,
    scheduleId,
    schedule,
    form,
    errors,
    loading,
    onChange,
    validateAndSave,
  } = useSessionScheduleUpdate();

  const daysCatalog = useCatalog("days");
  const timeSlotsCatalog = useCatalog("time_slots");
  const instructorsCatalog = useCatalog("users/role/3");
  const classroomsCatalog = useCatalog("classrooms");

  const handleSave = async () => {
    const result = await validateAndSave();
    if (result?.ok) {
      navigate(`/fichas/${fichaId}/ficha_terms/${fichaTermId}/schedule`);
    }
  };

  if (!schedule) {
    return (
      <div className="loading-center">
        <div>Cargando...</div>
      </div>
    );
  }

  const sections = [
    {
      left: [
        {
          title: "",
          content: (
            <>
              <InputField
                label="Día de la semana"
                name="day_id"
                value={form.day_id}
                onChange={onChange}
                options={daysCatalog.options}
                disabled={daysCatalog.loading || loading}
                error={errors.day_id}
                select
              />

              <InputField
                label="Instructor a cargo"
                name="instructor_id"
                value={form.instructor_id}
                onChange={onChange}
                options={instructorsCatalog.options}
                disabled={instructorsCatalog.loading || loading}
                error={errors.instructor_id}
                select
              />

              <InputField
                label="Ambiente de Formación"
                name="classroom_id"
                value={form.classroom_id}
                onChange={onChange}
                options={classroomsCatalog.options}
                disabled={classroomsCatalog.loading || loading}
                error={errors.classroom_id}
                select
              />
            </>
          ),
        },
      ],
      right: [
        {
          title: "",
          content: (
            <>
              <InputField
                label="Franja Horaria"
                name="time_slot_id"
                value={form.time_slot_id}
                onChange={onChange}
                options={timeSlotsCatalog.options}
                disabled={timeSlotsCatalog.loading || loading}
                error={errors.time_slot_id}
                select
              />

              <InputField
                label="Hora Inicio"
                name="start_time"
                type="time"
                value={form.start_time}
                disabled={loading}
                onChange={onChange}
                error={errors.start_time}
              />

              <InputField
                label="Hora Fin"
                name="end_time"
                type="time"
                value={form.end_time}
                disabled={loading}
                onChange={onChange}
                error={errors.end_time}
              />
            </>
          ),
        },
      ],
      footer: (
        <>
          <Button
            variant="secondary"
            onClick={() =>
              navigate(`/fichas/${fichaId}/ficha_terms/${fichaTermId}/schedule`)
            }
            disabled={loading}
          >
            Cancelar
          </Button>

          <Button variant="primary" onClick={handleSave} disabled={loading}>
            {loading ? "Guardando..." : "Guardar cambios"}
          </Button>
        </>
      ),
    },
  ];

  const side = [
    {
      title: "Resumen",
      variant: "default",
      content: (
        <>
          <InfoRow label="Ficha" value={schedule?.ficha?.number} />
          <InfoRow label="Programa de Formación" value={schedule?.ficha?.training_program_name} />
          <InfoRow label="Trimestre" value={schedule?.term?.name} />
          <InfoRow label="Fase" value={schedule?.phase?.name} />
          <InfoRow
            label="Periodo"
            value={
              schedule?.term_dates?.start_date && schedule?.term_dates?.end_date
                ? `${schedule.term_dates.start_date} - ${schedule.term_dates.end_date}`
                : "—"
            }
          />
        </>
      ),
    },
    {
      title: "Nota",
      variant: "info",
      content: <p>Los cambios se guardarán automáticamente en el sistema</p>,
    },
  ];

  return (
    <div className="session-schedule-create">
      <UserLayout
        onBack={() =>
          navigate(`/fichas/${fichaId}/ficha_terms/${fichaTermId}/schedule`)
        }
        actions={null}
      >
        <BlocksGrid sections={sections} side={side} />
      </UserLayout>
    </div>
  );
}