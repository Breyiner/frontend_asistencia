// Importación específica para navegación
import { useNavigate } from "react-router-dom"; // Navegación programática entre rutas

// Componentes de layout y formulario
import UserLayout from "../../components/UserLayout/UserLayout"; // Layout con barra superior y back
import BlocksGrid from "../../components/Blocks/BlocksGrid"; // Grid de 2 columnas responsive
import InputField from "../../components/InputField/InputField"; // Campo multi-tipo (text/select/time/textarea)
import Button from "../../components/Button/Button"; // Botones con variantes y loading
import InfoRow from "../../components/InfoRow/InfoRow"; // Fila informativa de solo lectura

// Hooks personalizados para lógica específica
import useCatalog from "../../hooks/useCatalog"; // Catálogos dinámicos del backend
import useSessionScheduleCreate from "../../hooks/useSessionScheduleCreate"; // Lógica completa de creación

/**
 * Página de creación de sesión planificada recurrente.
 * 
 * Crea **asignación semanal fija** (día/horario/instructor/ambiente)
 * para un horario de trimestre específico.
 * 
 * Contexto jerárquico:
 * Ficha → Trimestre/Fase → Horario → Sesión semanal
 * 
 * Campos obligatorios:
 * Izquierda: Día semana, Instructor, Ambiente
 * Derecha: Franja horaria, Hora inicio/fin
 * 
 * Características:
 * - 6 catálogos paralelos con loading independiente
 * - Panel resumen con contexto completo (ficha/programa/etc)
 * - Validación por campo + guardado atómico
 * - Redirección al horario padre post-creación
 * - UX optimizada para planificación repetitiva
 * 
 * Flujo:
 * 1. Carga contexto (horario/ficha) + 6 catálogos
 * 2. Usuario asigna día/horario/instructor/ambiente
 * 3. Validación completa → POST
 * 4. Regresa a vista del horario
 * 
 * @component
 * @returns {JSX.Element} Formulario de sesión semanal recurrente
 */
export default function SessionScheduleCreatePage() {
  // Hook de navegación programática
  const navigate = useNavigate();

  /**
   * Hook maestro que maneja TODO:
   * - IDs contextuales: fichaId, fichaTermId, scheduleId
   * - schedule: datos del horario padre
   * - form: estado formulario (day_id, instructor_id, etc)
   * - errors: errores validación por campo
   * - loading: guardado en progreso
   * - onChange: handler unificado
   * - validateAndSave: validación + POST asíncrono
   */
  const {
    fichaId,              // ID ficha de contexto (URL)
    fichaTermId,          // ID trimestre/fase (URL)
    scheduleId,           // ID horario específico (URL)
    schedule,             // Datos del horario padre
    form,                 // Formulario controlado
    errors,               // Errores por campo
    loading,              // Loading del guardado
    onChange,             // Handler cambios
    validateAndSave,      // Valida + guarda
  } = useSessionScheduleCreate();

  /**
   * Catálogos paralelos para selects (carga asíncrona independiente).
   */
  const daysCatalog = useCatalog("days");                    // Días de semana (Lun-Mar...)
  const timeSlotsCatalog = useCatalog("time_slots");         // Franjas horarias predefinidas
  const instructorsCatalog = useCatalog("users/role/4");     // Instructores (rol específico)
  const classroomsCatalog = useCatalog("classrooms/select");        // Ambientes físicos disponibles

  /**
   * Handler final de guardado con redirección contextual.
   * 
   * @async
   * 1. Ejecuta validación completa del formulario
   * 2. Si OK (result.ok) → realiza POST
   * 3. Regresa a página del horario padre (UX fluida)
   */
  const handleSave = async () => {
    const result = await validateAndSave(); // Valida TODOS los campos + guarda
    if (result?.ok) { // Verifica éxito completo
      // Redirige al horario padre (mejor UX que listado)
      navigate(`/fichas/${fichaId}/ficha_terms/${fichaTermId}/schedule`);
    }
  };

  /**
   * Early return: loading si horario no está listo.
   * Mejora UX evitando formulario vacío.
   */
  if (!schedule) {
    return (
      <div className="loading-center"> {/* Centrado responsive */}
        <div>Cargando...</div>          {/* Mensaje simple */}
      </div>
    );
  }

  /**
   * Sección principal del BlocksGrid (una sola sección completa).
   * 
   * Izquierda (3 campos): Día, Instructor, Ambiente
   * Derecha (4 campos): Franja, Hora inicio, Hora fin
   * Footer: Cancelar/Guardar
   */
  const sections = [
    {
      left: [
        {
          title: "", // Sin título de sección (header implícito)
          content: (
            <>
              {/* Select día de la semana (recurrente) */}
              <InputField
                label="Día de la semana"
                name="day_id"
                value={form.day_id}
                onChange={onChange}
                options={daysCatalog.options}
                disabled={daysCatalog.loading || loading} // Loading catálogo O guardado
                error={errors.day_id}
                select
              />

              {/* Select instructor (rol 4 específico) */}
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

              {/* Select ambiente físico */}
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
          title: "", // Sin título (continuación izquierda)
          content: (
            <>
              {/* Select franja horaria predefinida */}
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

              {/* Time picker hora inicio */}
              <InputField
                label="Hora Inicio"
                name="start_time"
                type="time"                      // Input nativo time
                value={form.start_time}
                disabled={loading}
                onChange={onChange}
                error={errors.start_time}
              />

              {/* Time picker hora fin */}
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
          {/* Botón cancelar: regresa al horario padre */}
          <Button
            variant="secondary"
            onClick={() => navigate(`/fichas/${fichaId}/ficha_terms/${fichaTermId}/schedule`)}
            disabled={loading}
          >
            Cancelar
          </Button>

          {/* Botón guardar principal */}
          <Button variant="primary" onClick={handleSave} disabled={loading}>
            {loading ? "Guardando..." : "Asignar Día"} {/* Texto dinámico */}
          </Button>
        </>
      ),
    },
  ];

  /**
   * Panel lateral con 2 secciones fijas.
   * 
   * 1. Resumen contextual (ficha/programa/trimestre/etc)
   * 2. Nota informativa estándar
   */
  const side = [
    {
      title: "Resumen", // Título del contexto
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
                ? `${schedule.term_dates.start_date} - ${schedule.term_dates.end_date}` // Rango completo
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
    <div className="session-schedule-create"> {/* Contenedor con estilos específicos */}
      <UserLayout
        onBack={() => navigate(`/fichas/${fichaId}/ficha_terms/${fichaTermId}/schedule`)} // Regresa al horario
        actions={null} // Sin barra de acciones adicionales
      >
        <BlocksGrid sections={sections} side={side} /> {/* Grid + panel lateral */}
      </UserLayout>
    </div>
  );
}
