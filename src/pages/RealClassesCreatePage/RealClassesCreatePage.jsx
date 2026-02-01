import { useMemo } from "react";
import { useNavigate } from "react-router-dom";

import UserLayout from "../../components/UserLayout/UserLayout";
import BlocksGrid from "../../components/Blocks/BlocksGrid";
import InputField from "../../components/InputField/InputField";
import Button from "../../components/Button/Button";

import useCatalog from "../../hooks/useCatalog";
import useRealClassCreate from "../../hooks/useRealClassCreate";
import useScheduleSessionsByFicha from "../../hooks/useScheduleSessionsByFicha";

export default function RealClassesCreatePage() {
  const navigate = useNavigate();
  const { form, errors, loading, onChange, validateAndSave } = useRealClassCreate();

  const fichasCatalog = useCatalog("fichas");
  const instructorsCatalog = useCatalog("users/role/4");
  const classroomsCatalog = useCatalog("classrooms");
  const timeSlotsCatalog = useCatalog("time_slots");
  const classTypesCatalog = useCatalog("class_types");

  const planned = useScheduleSessionsByFicha(form.ficha_id);

  const showOriginalDate = useMemo(() => String(form.class_type_id) === "3", [form.class_type_id]);

  const handleSave = async () => {
    const result = await validateAndSave();
    if (result?.ok) navigate("/real_classes");
  };

  const sections = [
    {
      left: [
        {
          title: "",
          content: (
            <>
              <InputField
                label="Ficha"
                name="ficha_id"
                value={form.ficha_id}
                onChange={onChange}
                options={fichasCatalog.options}
                disabled={fichasCatalog.loading || loading}
                error={errors.ficha_id}
                select
              />

              <InputField
                label="Instructor"
                name="instructor_id"
                value={form.instructor_id}
                onChange={onChange}
                options={instructorsCatalog.options}
                disabled={instructorsCatalog.loading || loading}
                error={errors.instructor_id}
                select
              />

              <InputField
                label="Ambiente"
                name="classroom_id"
                value={form.classroom_id}
                onChange={onChange}
                options={classroomsCatalog.options}
                disabled={classroomsCatalog.loading || loading}
                error={errors.classroom_id}
                select
              />

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
                label="Observaciones"
                name="observations"
                textarea
                value={form.observations}
                onChange={onChange}
                disabled={loading}
                error={errors.observations}
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
                label="Clase a Ejecutar"
                name="schedule_session_id"
                value={form.schedule_session_id}
                onChange={onChange}
                options={planned.options}
                disabled={!form.ficha_id || planned.loading || loading}
                error={errors.schedule_session_id}
                select
              />

              <InputField
                label="Hora Inicio"
                name="start_hour"
                type="time"
                value={form.start_hour}
                disabled={loading}
                onChange={onChange}
                error={errors.start_hour}
              />

              <InputField
                label="Hora Fin"
                name="end_hour"
                type="time"
                value={form.end_hour}
                disabled={loading}
                onChange={onChange}
                error={errors.end_hour}
              />

              <InputField
                label="Tipo de Clase"
                name="class_type_id"
                value={form.class_type_id}
                onChange={onChange}
                options={classTypesCatalog.options}
                disabled={classTypesCatalog.loading || loading}
                error={errors.class_type_id}
                select
              />

              {showOriginalDate ? (
                <InputField
                  label="Fecha de recuperación"
                  name="original_date"
                  type="date"
                  value={form.original_date}
                  disabled={loading}
                  onChange={onChange}
                  error={errors.original_date}
                />
              ) : null}
            </>
          ),
        },
      ],

      footer: (
        <>
          <Button variant="secondary" onClick={() => navigate("/real_classes")} disabled={loading}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleSave} disabled={loading}>
            {loading ? "Guardando..." : "Guardar Clase"}
          </Button>
        </>
      ),
    },
  ];

  const side = [

    {
      title: "Nota",
      variant: "info",
      content: <p>Los cambios se guardarán automáticamente en el sistema</p>,
    }

  ];

  return (
    <div className="real-class-create">
      <UserLayout onBack={() => navigate("/real_classes")} actions={null}>
        <BlocksGrid sections={sections} side={side} />
      </UserLayout>
    </div>
  );
}