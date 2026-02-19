// Importación específica para navegación programática
import { useNavigate } from "react-router-dom"; // Push/replace entre rutas dinámicas

// Componentes de layout y formulario
import UserLayout from "../../components/UserLayout/UserLayout"; // Layout con back + actions
import BlocksGrid from "../../components/Blocks/BlocksGrid"; // Grid responsive 2 columnas
import InputField from "../../components/InputField/InputField"; // Campo multi-tipo avanzado
import Button from "../../components/Button/Button"; // Botones con loading y variantes
import InfoRow from "../../components/InfoRow/InfoRow"; // Fila informativa solo lectura

// Hooks para catálogos y lógica específica
import useCatalog from "../../hooks/useCatalog"; // Catálogos asíncronos del backend
import useSessionScheduleUpdate from "../../hooks/useSessionScheduleUpdate"; // Lógica UPDATE completa

/**
 * Página de edición de sesión planificada recurrente existente.
 * 
 * **IDENTICA a creación** pero precargada con datos actuales.
 * Modifica asignación semanal (día/horario/instructor/ambiente).
 * 
 * **Única diferencia vs Create:**
 * - Hook: useSessionScheduleUpdate (PATCH vs POST)
 * - Texto botón: "Guardar cambios" vs "Asignar Día"
 * 
 * Contexto: Ficha → Trimestre → Horario → Sesión semanal
 * 
 * Campos editables:
 * Izquierda: Día semana, Instructor, Ambiente
 * Derecha: Franja horaria, Hora inicio, Hora fin
 * 
 * Flujo:
 * 1. Carga sesión existente + 4 catálogos
 * 2. Usuario modifica asignación semanal
 * 3. PATCH → regresa a horario padre
 * 
 * @component
 * @returns {JSX.Element} Formulario precargado para UPDATE sesión recurrente
 */
export default function SessionScheduleUpdatePage() {
  // Hook de navegación con rutas contextuales
  const navigate = useNavigate();

  /**
   * Hook específico de UPDATE (vs useSessionScheduleCreate):
   * - IDs contextuales: fichaId/fichaTermId/scheduleId (de URL)
   * - schedule: datos del horario/trimestre padre
   * - form: formulario PRECARGADO con datos actuales
   * - errors: errores validación reactivos
   * - loading: guardado PATCH en progreso
   * - onChange/validateAndSave: mismos que create (reutilización)
   */
  const {
    fichaId,              // ID ficha contextual (URL param)
    fichaTermId,          // ID trimestre/fase (URL param)
    scheduleId,           // ID horario (URL param)
    schedule,             // Horario padre (contexto)
    form,                 // Formulario con valores actuales
    errors,               // Errores por campo específicos
    loading,              // Loading del PATCH
    onChange,             // Handler cambios formulario
    validateAndSave,      // Valida + PATCH asíncrono
  } = useSessionScheduleUpdate();

  /**
   * 4 catálogos paralelos (mismos que create):
   * Carga asíncrona independiente con loading por catálogo.
   */
  const daysCatalog = useCatalog("days");                    // Lunes-Martes-...
  const timeSlotsCatalog = useCatalog("time_slots");         // Franjas predefinidas
  const instructorsCatalog = useCatalog("users/role/4");     // Instructores específicos
  const classroomsCatalog = useCatalog("classrooms/select");        // Ambientes disponibles

  /**
   * Handler de guardado UPDATE con redirección contextual.
   * 
   * @async
   * **ÚNICA diferencia vs Create:**
   * - Texto botón: "Guardar cambios"
   * - Backend: PATCH vs POST
   */
  const handleSave = async () => {
    const result = await validateAndSave(); // Valida + PATCH a backend
    if (result?.ok) { // Verifica éxito completo
      // Regresa al horario padre (UX consistente)
      navigate(`/fichas/${fichaId}/ficha_terms/${fichaTermId}/schedule`);
    }
  };

  /**
   * Early return: loading si contexto no está listo.
   * Evita formulario vacío/malformado.
   */
  if (!schedule) {
    return (
      <div className="loading-center"> {/* Loading centrado responsive */}
        <div>Cargando...</div>          {/* Mensaje simple */}
      </div>
    );
  }

  /**
   * **Estructura IDENTICA a Create** (copy-paste mantenido):
   * Izquierda: Día/Instructor/Ambiente (3 campos)
   * Derecha: Franja/Hora inicio/Hora fin (3 campos)
   * Footer: Cancelar/Guardar cambios
   */
  const sections = [
    {
      left: [
        {
          title: "", // Header implícito del contexto
          content: (
            <>
              {/* Select día semanal recurrente */}
              <InputField
                label="Día de la semana"
                name="day_id"
                value={form.day_id}              // Valor actual precargado
                onChange={onChange}
                options={daysCatalog.options}
                disabled={daysCatalog.loading || loading} // Loading catálogos O guardado
                error={errors.day_id}
                select
              />

              {/* Select instructor actualizado */}
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

              {/* Select ambiente actualizado */}
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
          title: "", // Continuación visual de izquierda
          content: (
            <>
              {/* Select franja horaria actualizada */}
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

              {/* Time picker inicio (editable) */}
              <InputField
                label="Hora Inicio"
                name="start_time"
                type="time"                    // Input nativo de tiempo
                value={form.start_time}
                disabled={loading}
                onChange={onChange}
                error={errors.start_time}
              />

              {/* Time picker fin (editable) */}
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
          {/* Cancelar: regresa al horario sin guardar */}
          <Button
            variant="secondary"
            onClick={() =>
              navigate(`/fichas/${fichaId}/ficha_terms/${fichaTermId}/schedule`) // Ruta padre exacta
            }
            disabled={loading}
          >
            Cancelar
          </Button>

          {/* **ÚNICO cambio vs Create**: texto botón */}
          <Button variant="primary" onClick={handleSave} disabled={loading}>
            {loading ? "Guardando..." : "Guardar cambios"} {/* Indica UPDATE */}
          </Button>
        </>
      ),
    },
  ];

  /**
   * Panel lateral IDENTICO a Create (contexto fijo).
   * Resumen operativo + nota informativa.
   */
  const side = [
    {
      title: "Resumen", // Contexto del horario
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
                ? `${schedule.term_dates.start_date} - ${schedule.term_dates.end_date}` // Rango fechas
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
    <div className="session-schedule-create"> {/* Estilos compartidos con create */}
      <UserLayout
        onBack={() =>
          navigate(`/fichas/${fichaId}/ficha_terms/${fichaTermId}/schedule`) // Horario padre
        }
        actions={null} // Sin actions adicionales
      >
        <BlocksGrid sections={sections} side={side} /> {/* Grid + panel */}
      </UserLayout>
    </div>
  );
}
