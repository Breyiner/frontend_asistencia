// Importaciones de React y React Router
import { useMemo } from "react"; // Hook de memoización para optimizar renders
import { useNavigate, useParams } from "react-router-dom"; // Navegación y parámetros de URL

// Layout y componentes de UI principales
import UserLayout from "../../components/UserLayout/UserLayout"; // Layout con barra superior y back button
import BlocksGrid from "../../components/Blocks/BlocksGrid"; // Sistema de grid de 2 columnas
import InfoRow from "../../components/InfoRow/InfoRow"; // Fila informativa de solo lectura
import InputField from "../../components/InputField/InputField"; // Campo de formulario multi-propósito
import Button from "../../components/Button/Button"; // Componente de botón estilizado

// Hooks personalizados para lógica de negocio
import useCatalog from "../../hooks/useCatalog"; // Catálogos dinámicos del backend
import useRealClassShow from "../../hooks/useRealClassShow"; // CRUD completo de clase real
import useScheduleSessionsByFicha from "../../hooks/useScheduleSessionsByFicha"; // Sesiones planeadas por ficha

// Utilidades de formato
import { weekdayEs } from "../../utils/dateFormat"; // Convierte fecha a día de semana en español

// Estilos y componentes auxiliares
import "../../components/Badge/Badge.css"; // Estilos globales de badges
import "./RealClassShowPage.css"; // Estilos específicos de esta página
import BadgesCompact from "../../components/BadgesCompact/BadgesCompact"; // Badges compactos múltiples

/**
 * Página de visualización y edición de clase real específica.
 * 
 * Muestra detalles completos de una clase ejecutada/programada con
 * modo edición inline, acceso rápido a asistencias y contexto completo.
 * 
 * Características:
 * - Header visual destacado con día/fecha/programa/ficha
 * - Botón acceso directo a asistencias (modo lectura)
 * - Layout asimétrico de 2 columnas con campos contextuales
 * - Modo edición completo con catálogos dinámicos
 * - Campo condicional: fecha original (solo tipo=recuperación)
 * - Panel lateral con estadísticas y metadatos
 * 
 * Secciones en modo lectura:
 * - Header destacado + botón asistencias
 * - Izquierda: fecha, horario, ambiente, tipo, observaciones
 * - Derecha: ficha, programa, trimestre, instructor, ratio asistencias
 * 
 * Secciones en modo edición:
 * - Izquierda: instructor, ambiente, franja, observaciones
 * - Derecha: sesión planeada, horas, tipo, fecha original
 * 
 * @component
 * @returns {JSX.Element} Detalle completo de clase real con edición inline
 */
export default function RealClassShowPage() {
  // Extrae ID de clase real de parámetros de URL
  const { realClassId } = useParams();
  // Hook de navegación programática
  const navigate = useNavigate();

  /**
   * Hook principal de gestión CRUD de clase real.
   * 
   * Proporciona:
   * - realClass: datos completos de la clase
   * - loading: carga inicial
   * - isEditing: estado de modo edición activo
   * - form/errors: formulario de edición + validación
   * - saving: guardado en progreso
   * - startEdit/cancelEdit: toggles de modo edición
   * - onChange: handler unificado de cambios
   * - save: función de actualización
   * - deleteRealClass: eliminación completa
   */
  const {
    realClass,        // Datos completos de la clase real
    loading,          // Loading inicial de datos
    isEditing,        // Modo edición activo (true/false)
    form,            // Estado del formulario de edición
    errors,          // Errores de validación por campo
    saving,          // Guardado en progreso
    startEdit,       // Activa modo edición
    cancelEdit,      // Cancela y resetea formulario
    onChange,        // Handler de cambios en formulario
    save,           // Guarda cambios al backend
    deleteRealClass, // Elimina clase completa
  } = useRealClassShow(realClassId);

  // Catálogos estáticos para campos editables
  const instructorsCatalog = useCatalog("users/role/4"); // Usuarios con rol instructor
  const classroomsCatalog = useCatalog("classrooms"); // Ambientes físicos disponibles
  const timeSlotsCatalog = useCatalog("time_slots"); // Franjas horarias predefinidas
  const classTypesCatalog = useCatalog("class_types"); // Tipos de clase (normal/recuperación/extra)

  /**
   * Catálogo dinámico de sesiones planeadas.
   * Solo carga cuando ficha existe (dependencia reactiva).
   */
  const planned = useScheduleSessionsByFicha(realClass?.ficha?.id);

  /**
   * Determina visibilidad del campo "fecha original".
   * Solo visible cuando tipo de clase es "3" (recuperación).
   */
  const showOriginalDate = useMemo(
    () => String(form.class_type_id) === "3", // Conversión a string para comparación segura
    [form.class_type_id] // Recalcula solo al cambiar tipo de clase
  );

  /**
   * Formatea día de la semana en español con mayúscula inicial.
   * Ejemplo: "2026-02-16" → "Lunes"
   */
  const dayLabel = useMemo(() => {
    const w = weekdayEs(realClass?.class_date); // Obtiene día en minúsculas
    if (!w) return ""; // Retorna vacío si no hay fecha
    return w.charAt(0).toUpperCase() + w.slice(1); // Capitaliza primera letra
  }, [realClass?.class_date]); // Recalcula solo al cambiar fecha

  /**
   * Genera título dinámico del header.
   * Formato: "Clase - Lunes 2026-02-16"
   */
  const title = useMemo(() => {
    const date = realClass?.class_date || "—"; // Fecha o placeholder
    return `Clase - ${dayLabel ? `${dayLabel} ` : ""}${date}`; // Combina día + fecha
  }, [realClass?.class_date, dayLabel]); // Dependencias del título

  /**
   * Barra de acciones contextual según modo.
   * 
   * Modo edición: Cancelar + Guardar
   * Modo lectura: Editar + Eliminar
   * Null si no hay datos cargados
   */
  const actions = useMemo(() => {
    if (!realClass) return null; // Sin datos, sin acciones

    return isEditing ? (
      // Acciones en modo edición
      <>
        <Button variant="secondary" onClick={cancelEdit} disabled={saving}>
          Cancelar
        </Button>
        <Button variant="primary" onClick={save} disabled={saving}>
          {saving ? "Guardando..." : "Guardar"} {/* Texto dinámico según estado */}
        </Button>
      </>
    ) : (
      // Acciones en modo lectura
      <>
        <Button variant="primary" onClick={startEdit} disabled={saving}>
          Editar
        </Button>
        <Button variant="danger" onClick={deleteRealClass} disabled={saving}>
          Eliminar
        </Button>
      </>
    );
  }, [realClass, isEditing, saving, cancelEdit, save, startEdit, deleteRealClass]);

  /**
   * Construye secciones del BlocksGrid dinámicamente.
   * 
   * Estructura de 2 bloques:
   * 1. Header destacado (solo columna izquierda)
   * 2. Contenido principal (2 columnas con condicionales)
   */
  const sections = useMemo(() => {
    if (!realClass) return []; // Sin datos, sin secciones

    return [
      {
        // Bloque 1: Header prominente con contexto
        left: [
          {
            title: "", // Sin título de sección
            content: (
              <>
                <div className="header-real-class"> {/* Contenedor visual destacado */}
                  <div className="header-real-class__container-title">
                    {/* Título principal: "Clase - Lunes 2026-02-16" */}
                    <span className="header-real-class__title">{title}</span>
                    {/* Línea 1: Nombre del programa */}
                    <div className="header-real-class__content">{realClass.training_program?.name || "—"}</div>
                    {/* Línea 2: Número de ficha */}
                    <div className="header-real-class__content">Ficha {realClass.ficha?.number || "—"}</div>
                  </div>
                  {/* Botón "Ver Asistencias" solo en modo lectura */}
                  {!isEditing && (
                    <div style={{ marginBottom: 16 }}> {/* Espaciado inferior inline */}
                      <Button
                        variant="primary"
                        onClick={() => navigate(`/real_classes/${realClassId}/attendances`)} // Navegación a sub-página
                        disabled={saving}
                      >
                        Ver Asistencias
                      </Button>
                    </div>
                  )}
                </div>
              </>
            )
          }
        ]
      },
      {
        // Bloque 2: Contenido principal en 2 columnas
        left: [
          {
            title: "", // Sin título de sección
            content: (
              <>
                {isEditing ? (
                  // MODO EDICIÓN - Columna izquierda: configuración básica
                  <>
                    {/* Select de instructor con catálogo dinámico */}
                    <InputField
                      label="Instructor"
                      name="instructor_id"
                      value={form.instructor_id}
                      onChange={onChange}
                      options={instructorsCatalog.options}
                      disabled={instructorsCatalog.loading || saving} // Deshabilitado si carga o guarda
                      error={errors.instructor_id}
                      select
                    />

                    {/* Select de ambiente físico */}
                    <InputField
                      label="Ambiente"
                      name="classroom_id"
                      value={form.classroom_id}
                      onChange={onChange}
                      options={classroomsCatalog.options}
                      disabled={classroomsCatalog.loading || saving}
                      error={errors.classroom_id}
                      select
                    />

                    {/* Select de franja horaria */}
                    <InputField
                      label="Franja Horaria"
                      name="time_slot_id"
                      value={form.time_slot_id}
                      onChange={onChange}
                      options={timeSlotsCatalog.options}
                      disabled={timeSlotsCatalog.loading || saving}
                      error={errors.time_slot_id}
                      select
                    />

                    {/* Textarea de observaciones */}
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
                  // MODO LECTURA - Columna izquierda: detalles operativos
                  <>
                    {/* Fecha con día de semana formateado */}
                    <InfoRow
                      label="Fecha"
                      value={
                        realClass.class_date
                          ? `${realClass.class_date} - ${dayLabel || "—"}` // Combina fecha + día
                          : "—"
                      }
                    />
                    {/* Horario en formato HH:MM - HH:MM */}
                    <InfoRow
                      label="Horario"
                      value={
                        realClass.start_hour && realClass.end_hour
                          ? `${realClass.start_hour} - ${realClass.end_hour}`
                          : "—"
                      }
                    />
                    {/* Franja horaria nominal */}
                    <InfoRow label="Franja Horaria" value={realClass.time_slot?.name || "—"} />
                    {/* Ambiente asignado */}
                    <InfoRow label="Ambiente" value={realClass.classroom?.name || "—"} />
                    {/* Tipo de clase */}
                    <InfoRow label="Tipo de clase" value={realClass.class_type?.name || "—"} />

                    {/* Fecha original (solo si es recuperación) */}
                    {realClass.original_date ? (
                      <InfoRow label="Fecha de recuperación" value={realClass.original_date} />
                    ) : null}

                    {/* Observaciones (solo si existen) */}
                    {realClass.observations ? (
                      <InfoRow label="Observaciones" value={realClass.observations} />
                    ) : null}
                  </>
                )}
              </>
            ),
          },
        ],

        right: [
          {
            title: "", // Sin título de sección
            content: (
              <>
                {!isEditing ? (
                  // MODO LECTURA - Columna derecha: contexto de ficha/programa
                  <>
                    {/* Número de ficha */}
                    <InfoRow label="Ficha" value={realClass.ficha?.number || "—"} />
                    {/* Programa de formación */}
                    <InfoRow label="Programa" value={realClass.training_program?.name || "—"} />
                    {/* Trimestre actual */}
                    <InfoRow label="Trimestre" value={realClass.term?.name || "Sin trimestre"} />
                    {/* Instructor asignado */}
                    <InfoRow
                      label="Instructor (asignado)"
                      value={realClass.instructor?.name || "Sin instructor"}
                    />
                    {/* Ratio de asistencias como badge verde */}
                    <InfoRow
                      label="Asistencias"
                      value={
                        <BadgesCompact
                          items={[realClass.attendance_ratio ?? "0/0"]} // Formato "presentes/total"
                          maxVisible={1}
                          badgeClassName="badge badge--green"
                        />
                      }
                    />
                  </>
                ) : (
                  // MODO EDICIÓN - Columna derecha: configuración de ejecución
                  <>
                    {/* Select de sesión planeada (dependiente de ficha) */}
                    <InputField
                      label="Clase a Ejecutar"
                      name="schedule_session_id"
                      value={form.schedule_session_id}
                      onChange={onChange}
                      options={planned.options}
                      disabled={!realClass?.ficha?.id || planned.loading || saving} // Requiere ficha válida
                      error={errors.schedule_session_id}
                      select
                    />

                    {/* Input de hora inicio (time picker) */}
                    <InputField
                      label="Hora Inicio"
                      name="start_hour"
                      type="time"
                      value={form.start_hour}
                      onChange={onChange}
                      disabled={saving}
                      error={errors.start_hour}
                    />

                    {/* Input de hora fin (time picker) */}
                    <InputField
                      label="Hora Fin"
                      name="end_hour"
                      type="time"
                      value={form.end_hour}
                      onChange={onChange}
                      disabled={saving}
                      error={errors.end_hour}
                    />

                    {/* Select de tipo de clase */}
                    <InputField
                      label="Tipo de Clase"
                      name="class_type_id"
                      value={form.class_type_id}
                      onChange={onChange}
                      options={classTypesCatalog.options}
                      disabled={classTypesCatalog.loading || saving}
                      error={errors.class_type_id}
                      select
                    />

                    {/* Campo condicional: fecha original (solo tipo=3) */}
                    {showOriginalDate ? (
                      <InputField
                        label="Fecha de recuperación"
                        name="original_date"
                        type="date"
                        value={form.original_date}
                        onChange={onChange}
                        disabled={saving}
                        error={errors.original_date}
                      />
                    ) : null}
                  </>
                )}
              </>
            ),
          },
        ],
      }
    ];
  }, [
    // Dependencias extensas del useMemo (optimización crítica)
    realClass,                      // Datos base
    title,                         // Título dinámico
    dayLabel,                      // Día de semana
    isEditing,                     // Modo actual
    form,                          // Estado formulario
    errors,                        // Errores validación
    onChange,                      // Handler cambios
    saving,                        // Estado guardado
    instructorsCatalog.options,    // Opciones instructores
    instructorsCatalog.loading,    // Loading instructores
    classroomsCatalog.options,     // Opciones ambientes
    classroomsCatalog.loading,     // Loading ambientes
    timeSlotsCatalog.options,      // Opciones franjas
    timeSlotsCatalog.loading,      // Loading franjas
    classTypesCatalog.options,     // Opciones tipos
    classTypesCatalog.loading,     // Loading tipos
    planned.options,               // Sesiones planeadas
    planned.loading,               // Loading sesiones
    showOriginalDate,              // Visibilidad campo condicional
    navigate,                      // Función navegación
    realClassId,                   // ID de ruta
  ]);

  /**
   * Panel lateral con información contextual dinámica.
   * 
   * Modo edición: Solo nota informativa
   * Modo lectura: Estadísticas + metadatos + instrucciones
   */
  const side = useMemo(() => {
    if (!realClass || isEditing) {
      // Panel simplificado en modo edición
      return [
        {
          title: "Nota",
          variant: "info",
          content: <p>Los cambios se guardarán automáticamente en el sistema</p>,
        },
      ];
    }

    // Panel completo en modo lectura
    return [
      {
        title: "Detalles",
        variant: "default",
        content: (
          <>
            {/* Total de aprendices esperados */}
            <InfoRow label="Total Aprendices" value={realClass.apprentices_count ?? 0} />
          </>
        ),
      },
      {
        title: "Información Adicional",
        variant: "default",
        content: (
          <>
            {/* ID interno del sistema */}
            <InfoRow label="ID" value={realClass.id} />
            {/* Fecha de creación del registro */}
            <InfoRow label="Fecha registro" value={realClass.class_date || "—"} />
            {/* Última modificación */}
            <InfoRow label="Última actualización" value={realClass.updated_at || "—"} />
          </>
        ),
      },
      {
        title: "Nota",
        variant: "info",
        content: (
          <p>
            {/* Instrucciones operativas */}
            Recuerda registrar las asistencias al iniciar la clase. Una vez registradas, podrás
            modificarlas si es necesario.
          </p>
        ),
      },
    ];
  }, [realClass, isEditing]); // Recalcula solo al cambiar clase o modo

  // Early returns para estados críticos
  if (loading) return <div>Cargando...</div>; // Loading inicial
  if (!realClass) return <div>Clase no encontrada</div>; // Error 404

  return (
    <div className="real-class-show"> {/* Contenedor principal con clase CSS */}
      {/* Layout con back button y acciones contextuales */}
      <UserLayout onBack={() => navigate("/real_classes")} actions={actions}>
        {/* Grid de bloques con 2 columnas + panel lateral */}
        <BlocksGrid sections={sections} side={side} />
      </UserLayout>
    </div>
  );
}
