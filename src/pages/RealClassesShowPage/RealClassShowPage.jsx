// Importaciones de React y React Router
import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";

// Layout y componentes de UI principales
import UserLayout from "../../components/UserLayout/UserLayout";
import BlocksGrid from "../../components/Blocks/BlocksGrid";
import InfoRow from "../../components/InfoRow/InfoRow";
import InputField from "../../components/InputField/InputField";
import Button from "../../components/Button/Button";

// Hooks personalizados para lógica de negocio
import useCatalog from "../../hooks/useCatalog";
import useRealClassShow from "../../hooks/useRealClassShow";
import useScheduleSessionsByFicha from "../../hooks/useScheduleSessionsByFicha";

// Utilidades de formato ← AGREGADO
import { weekdayEs } from "../../utils/dateFormat";
import { can } from "../../utils/auth";

// Estilos y componentes auxiliares
import "../../components/Badge/Badge.css";
import "./RealClassShowPage.css";
import BadgesCompact from "../../components/BadgesCompact/BadgesCompact";

/**
 * Página de visualización y edición de clase real específica.
 * 
 * PERMISOS: Control granular con `can()` utility 
 */
export default function RealClassShowPage() {
  // Extrae ID de clase real de parámetros de URL
  const { realClassId } = useParams();
  const navigate = useNavigate();

  //: Permisos usando solo `can()` utility (sin hooks)
  const canEdit = can("real_classes.update");
  const canDelete = can("real_classes.delete");
  const canViewAttendances = can("attendances.byClassRealId");

  /**
   * Hook principal de gestión CRUD de clase real.
   */
  const {
    realClass,
    loading,
    isEditing,
    form,
    errors,
    saving,
    startEdit,
    cancelEdit,
    onChange,
    save,
    deleteRealClass,
  } = useRealClassShow(realClassId);

  // Catálogos para campos editables (solo si puede editar) ← NUEVO
  const instructorsCatalog = useCatalog("users/role/INSTRUCTOR", { enabled: canEdit });
  const classroomsCatalog = useCatalog("classrooms/select", { enabled: canEdit });
  const timeSlotsCatalog = useCatalog("time_slots", { enabled: canEdit });
  const classTypesCatalog = useCatalog("class_types", { enabled: canEdit });

  /**
   * Catálogo dinámico de sesiones planeadas.
   */
  const planned = useScheduleSessionsByFicha(realClass?.ficha?.id);

  /**
   * Determina visibilidad del campo "fecha original".
   */
  const showOriginalDate = useMemo(
    () => String(form.class_type_id) === "3",
    [form.class_type_id]
  );

  /**
   * Formatea día de la semana en español con mayúscula inicial.
   */
  const dayLabel = useMemo(() => {
    const w = weekdayEs(realClass?.class_date);
    if (!w) return "";
    return w.charAt(0).toUpperCase() + w.slice(1);
  }, [realClass?.class_date]);

  /**
   * Genera título dinámico del header.
   */
  const title = useMemo(() => {
    const date = realClass?.class_date || "—";
    return `Clase - ${dayLabel ? `${dayLabel} ` : ""}${date}`;
  }, [realClass?.class_date, dayLabel]);

  /**
   * Barra de acciones contextual según modo Y permisos. 
   */
  const actions = useMemo(() => {
    if (!realClass) return null;

    return isEditing ? (
      // Acciones en modo edición
      <>
        <Button variant="secondary" onClick={cancelEdit} disabled={saving}>
          Cancelar
        </Button>
        <Button variant="primary" onClick={save} disabled={saving}>
          {saving ? "Guardando..." : "Guardar"}
        </Button>
      </>
    ) : (
      // Acciones en modo lectura ← PROTEGIDO
      <>
        {/* ← Botón Editar solo si tiene permiso */}
        {canEdit && (
          <Button variant="primary" onClick={startEdit} disabled={saving}>
            Editar
          </Button>
        )}
        {/* ← Botón Eliminar solo si tiene permiso */}
        {canDelete && (
          <Button variant="danger" onClick={deleteRealClass} disabled={saving}>
            Eliminar
          </Button>
        )}
      </>
    );
  }, [realClass, isEditing, saving, cancelEdit, save, startEdit, deleteRealClass, canEdit, canDelete]);

  /**
   * Construye secciones del BlocksGrid dinámicamente.
   */
  const sections = useMemo(() => {
    if (!realClass) return [];

    return [
      {
        // Bloque 1: Header prominente con contexto
        left: [
          {
            title: "",
            content: (
              <>
                <div className="header-real-class">
                  <div className="header-real-class__container-title">
                    <span className="header-real-class__title">{title}</span>
                    <div className="header-real-class__content">{realClass.training_program?.name || "—"}</div>
                    <div className="header-real-class__content">Ficha {realClass.ficha?.number || "—"}</div>
                  </div>
                  {/* Botón "Ver Asistencias" solo en modo lectura */}
                  {!isEditing && canViewAttendances&& (
                    <div style={{ marginBottom: 16 }}>
                      <Button
                        variant="primary"
                        onClick={() => navigate(`/real_classes/${realClassId}/attendances`)}
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
        // Bloque 2: Contenido principal en 2 columnas ← PROTEGIDO
        left: [
          {
            title: "",
            content: (
              <>
                {/* ← Formularios SOLO en modo edición Y con permiso */}
                {isEditing && canEdit ? (
                  <>
                    <InputField
                      label="Instructor"
                      name="instructor_id"
                      value={form.instructor_id}
                      onChange={onChange}
                      options={instructorsCatalog.options}
                      disabled={instructorsCatalog.loading || saving}
                      error={errors.instructor_id}
                      combo
                    />
                    <InputField
                      label="Ambiente"
                      name="classroom_id"
                      value={form.classroom_id}
                      onChange={onChange}
                      options={classroomsCatalog.options}
                      disabled={classroomsCatalog.loading || saving}
                      error={errors.classroom_id}
                      combo
                    />
                    <InputField
                      label="Franja Horaria"
                      name="time_slot_id"
                      value={form.time_slot_id}
                      onChange={onChange}
                      options={timeSlotsCatalog.options}
                      disabled={timeSlotsCatalog.loading || saving}
                      error={errors.time_slot_id}
                      combo
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
                  // MODO LECTURA - Columna izquierda: detalles operativos
                  <>
                    <InfoRow
                      label="Fecha"
                      value={
                        realClass.class_date
                          ? `${realClass.class_date} - ${dayLabel || "—"}`
                          : "—"
                      }
                    />
                    <InfoRow
                      label="Horario"
                      value={
                        realClass.start_hour && realClass.end_hour
                          ? `${realClass.start_hour} - ${realClass.end_hour}`
                          : "—"
                      }
                    />
                    <InfoRow label="Franja Horaria" value={realClass.time_slot?.name || "—"} />
                    <InfoRow label="Ambiente" value={realClass.classroom?.name || "—"} />
                    <InfoRow label="Tipo de clase" value={realClass.class_type?.name || "—"} />
                    {realClass.original_date ? (
                      <InfoRow label="Fecha de recuperación" value={realClass.original_date} />
                    ) : null}
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
            title: "",
            content: (
              <>
                {!isEditing ? (
                  // MODO LECTURA - Columna derecha: contexto de ficha/programa
                  <>
                    <InfoRow label="Ficha" value={realClass.ficha?.number || "—"} />
                    <InfoRow label="Programa" value={realClass.training_program?.name || "—"} />
                    <InfoRow label="Trimestre" value={realClass.term?.name || "Sin trimestre"} />
                    <InfoRow
                      label="Instructor (asignado)"
                      value={realClass.instructor?.name || "Sin instructor"}
                    />
                    <InfoRow
                      label="Asistencias"
                      value={
                        <BadgesCompact
                          items={[realClass.attendance_ratio ?? "0/0"]}
                          maxVisible={1}
                          badgeClassName="badge badge--green"
                        />
                      }
                    />
                  </>
                ) : (
                  // MODO EDICIÓN - Columna derecha: configuración de ejecución ← PROTEGIDO
                  <>
                    {canEdit && (
                      <>
                        <InputField
                          label="Clase a Ejecutar"
                          name="schedule_session_id"
                          value={form.schedule_session_id}
                          onChange={onChange}
                          options={planned.options}
                          disabled={!realClass?.ficha?.id || planned.loading || saving}
                          error={errors.schedule_session_id}
                          combo
                        />
                        <InputField
                          label="Hora Inicio"
                          name="start_hour"
                          type="time"
                          value={form.start_hour}
                          onChange={onChange}
                          disabled={saving}
                          error={errors.start_hour}
                        />
                        <InputField
                          label="Hora Fin"
                          name="end_hour"
                          type="time"
                          value={form.end_hour}
                          onChange={onChange}
                          disabled={saving}
                          error={errors.end_hour}
                        />
                        <InputField
                          label="Tipo de Clase"
                          name="class_type_id"
                          value={form.class_type_id}
                          onChange={onChange}
                          options={classTypesCatalog.options}
                          disabled={classTypesCatalog.loading || saving}
                          error={errors.class_type_id}
                          combo
                        />
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
                )}
              </>
            ),
          },
        ],
      }
    ];
  }, [
    realClass,
    title,
    dayLabel,
    isEditing,
    canEdit,
    form,
    errors,
    onChange,
    saving,
    instructorsCatalog.options,
    instructorsCatalog.loading,
    classroomsCatalog.options,
    classroomsCatalog.loading,
    timeSlotsCatalog.options,
    timeSlotsCatalog.loading,
    classTypesCatalog.options,
    classTypesCatalog.loading,
    planned.options,
    planned.loading,
    showOriginalDate,
    navigate,
    realClassId,
  ]);

  /**
   * Panel lateral con información contextual dinámica.
   */
  const side = useMemo(() => {
    if (!realClass || isEditing) {
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
        title: "Detalles",
        variant: "default",
        content: (
          <>
            <InfoRow label="Total Aprendices" value={realClass.apprentices_count ?? 0} />
          </>
        ),
      },
      {
        title: "Información Adicional",
        variant: "default",
        content: (
          <>
            <InfoRow label="ID" value={realClass.id} />
            <InfoRow label="Fecha registro" value={realClass.class_date || "—"} />
            <InfoRow label="Última actualización" value={realClass.updated_at || "—"} />
          </>
        ),
      },
      {
        title: "Nota",
        variant: "info",
        content: (
          <p>
            Recuerda registrar las asistencias al iniciar la clase. Una vez registradas, podrás
            modificarlas si es necesario.
          </p>
        ),
      },
    ];
  }, [realClass, isEditing]);

  // Early returns para estados críticos
  if (loading) return <div>Cargando...</div>;
  if (!realClass) return <div>Clase no encontrada</div>;

  return (
    <div className="real-class-show">
      <UserLayout onBack={() => navigate("/real_classes")} actions={actions}>
        <BlocksGrid sections={sections} side={side} />
      </UserLayout>
    </div>
  );
}
