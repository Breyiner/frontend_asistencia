// Importaciones de React y React Router
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";

// Layout y componentes de UI
import UserLayout from "../../components/UserLayout/UserLayout";
import BlocksGrid from "../../components/Blocks/BlocksGrid";
import InputField from "../../components/InputField/InputField";
import Button from "../../components/Button/Button";

// Hooks personalizados
import useCatalog from "../../hooks/useCatalog";
import useRealClassCreate from "../../hooks/useRealClassCreate";
import useScheduleSessionsByFicha from "../../hooks/useScheduleSessionsByFicha";

/**
 * Página de creación de clase real (ejecución de clase programada).
 * 
 * Formulario completo para programar una clase real asociada a
 * ficha, instructor, ambiente y horario específico.
 * 
 * Características:
 * - Layout de 2 columnas balanceado (configuración básica + ejecución)
 * - Catálogos múltiples con carga paralela
 * - Dependencia dinámica: sesiones planeadas por ficha seleccionada
 * - Campo condicional: fecha original (solo tipo clase=3/recuperación)
 * - Observaciones como textarea
 * - Validación completa por campo
 * 
 * Campos principales (izquierda):
 * - Ficha (desencadena carga de sesiones)
 * - Instructor (rol 4)
 * - Ambiente
 * - Franja horaria
 * - Observaciones
 * 
 * Campos de ejecución (derecha):
 * - Clase a ejecutar (depende de ficha)
 * - Hora inicio/fin (time)
 * - Tipo de clase
 * - Fecha recuperación (condicional)
 * 
 * Flujo:
 * 1. Usuario selecciona ficha → carga sesiones planeadas
 * 2. Completa configuración completa
 * 3. Validación + guardado POST
 * 4. Redirección a lista de clases reales
 * 
 * @component
 * @returns {JSX.Element} Formulario de creación de clase real
 */
export default function RealClassesCreatePage() {
  // Navegación programática
  const navigate = useNavigate();

  /**
   * Hook principal de gestión de creación de clase real.
   * Retorna: form, errors, loading, onChange, validateAndSave
   */
  const { form, errors, loading, onChange, validateAndSave } = useRealClassCreate();

  /**
   * Catálogos estáticos para selects principales.
   * fichas: fichas disponibles
   * instructors: usuarios rol 4
   * classrooms: ambientes físicos
   * timeSlots: franjas horarias
   * classTypes: tipos de clase
   */
  const fichasCatalog = useCatalog("fichas/select");
  const instructorsCatalog = useCatalog("users/role/INSTRUCTOR");
  const classroomsCatalog = useCatalog("classrooms/select");
  const timeSlotsCatalog = useCatalog("time_slots");
  const classTypesCatalog = useCatalog("class_types");

  /**
   * Hook dinámico de sesiones planeadas por ficha.
   * 
   * Se actualiza automáticamente al cambiar form.ficha_id.
   * Retorna: options (para select), loading
   */
  const planned = useScheduleSessionsByFicha(form.ficha_id);

  /**
   * Visibilidad condicional del campo "fecha de recuperación".
   * 
   * Solo visible cuando class_type_id === "3" (recuperación).
   */
  const showOriginalDate = useMemo(() => String(form.class_type_id) === "3", [form.class_type_id]);

  /**
   * Handler de guardado final.
   * 
   * @async
   * 1. Valida formulario completo
   * 2. Si OK, ejecuta guardado
   * 3. Redirige a lista principal
   */
  const handleSave = async () => {
    const result = await validateAndSave();
    if (result?.ok) navigate("/real_classes");
  };

  /**
   * Sección principal del formulario (una sola sección).
   * 
   * Izquierda - Configuración básica (5 campos):
   * Ficha → Instructor → Ambiente → Franja → Observaciones
   * 
   * Derecha - Ejecución (5 campos + condicional):
   * Sesión planeada → Horas → Tipo clase → Fecha original (si aplica)
   */
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
                combo
              />

              <InputField
                label="Instructor"
                name="instructor_id"
                value={form.instructor_id}
                onChange={onChange}
                options={instructorsCatalog.options}
                disabled={instructorsCatalog.loading || loading}
                error={errors.instructor_id}
                combo
              />

              <InputField
                label="Ambiente"
                name="classroom_id"
                value={form.classroom_id}
                onChange={onChange}
                options={classroomsCatalog.options}
                disabled={classroomsCatalog.loading || loading}
                error={errors.classroom_id}
                combo
              />

              <InputField
                label="Franja Horaria"
                name="time_slot_id"
                value={form.time_slot_id}
                onChange={onChange}
                options={timeSlotsCatalog.options}
                disabled={timeSlotsCatalog.loading || loading}
                error={errors.time_slot_id}
                combo
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
                combo
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
                combo
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

  /**
   * Panel lateral con nota informativa estándar.
   */
  const side = [
    {
      title: "Nota",
      variant: "info",
      content: <p>Los cambios se guardarán automáticamente en el sistema</p>,
    },
  ];

  return (
    <div className="real-class-create">
      <UserLayout onBack={() => navigate("/real_classes")} actions={null}>
        <BlocksGrid sections={sections} side={side} />
      </UserLayout>
    </div>
  );
}
