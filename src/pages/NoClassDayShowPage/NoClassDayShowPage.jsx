// Importaciones de React y React Router
import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";

// Layout y componentes de UI
import UserLayout from "../../components/UserLayout/UserLayout";
import BlocksGrid from "../../components/Blocks/BlocksGrid";
import InfoRow from "../../components/InfoRow/InfoRow";
import InputField from "../../components/InputField/InputField";
import Button from "../../components/Button/Button";

// Hooks personalizados
import useCatalog from "../../hooks/useCatalog";
import useNoClassDayShow from "../../hooks/useNoClassDayShow";

// Utilidades de formato
import { weekdayEs } from "../../utils/dateFormat";

// Estilos específicos
import "./NoClassDayShowPage.css";

/**
 * Página de visualización y edición de día sin clase específico.
 * 
 * Muestra detalles completos de un día sin clase con capacidades
 * de edición inline y eliminación. Incluye header destacado con
 * fecha y contexto de ficha/programa.
 * 
 * Características:
 * - Header visual prominente con día de semana y fecha
 * - Modo lectura/edición alternable
 * - Layout asimétrico: detalles principales izquierda, ficha derecha
 * - Campos editables: ficha, fecha, motivo, observaciones
 * - Información contextual de ficha (programa, jornada, gestor)
 * - Panel lateral dinámico según modo (metadatos o nota)
 * - Optimización con useMemo para múltiples secciones complejas
 * 
 * Flujo:
 * 1. Carga día sin clase por ID desde URL
 * 2. Genera título con formato legible (Lunes 15/02/2026)
 * 3. Renderiza según modo (lectura/edición)
 * 4. Maneja guardado, cancelación, eliminación
 * 
 * @component
 * @returns {JSX.Element} Detalle completo de día sin clase
 */
export default function NoClassDayShowPage() {
  // Parámetros de ruta y navegación
  const { noClassDayId } = useParams();
  const navigate = useNavigate();

  /**
   * Hook principal que gestiona toda la lógica CRUD del día sin clase.
   * 
   * Retorna:
   * - noClassDay: datos completos del registro
   * - loading: carga inicial de datos
   * - isEditing: estado de modo edición
   * - form: valores del formulario (edición)
   * - errors: errores de validación por campo
   * - saving: guardado en progreso
   * - startEdit/cancelEdit: alternar modo edición
   * - onChange: handler de cambios de formulario
   * - save: función de actualización
   * - deleteNoClassDay: eliminación del registro
   */
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

  // Catálogos para campos editables
  const fichasCatalog = useCatalog("fichas/select");
  const reasonsCatalog = useCatalog("no_class_reasons");

  /**
   * Formato del día de la semana en español.
   * 
   * Ej: "lunes" → "Lunes"
   * Utiliza utilidad weekdayEs para localización.
   */
  const dayLabel = useMemo(() => {
    const w = weekdayEs(noClassDay?.date);
    if (!w) return "";
    return w.charAt(0).toUpperCase() + w.slice(1);
  }, [noClassDay?.date]);

  /**
   * Título principal del header destacado.
   * 
   * Formato: "Día sin clase - Lunes 15/02/2026"
   * Se actualiza dinámicamente con fecha y día de semana.
   */
  const title = useMemo(() => {
    const date = noClassDay?.date || "—";
    return `Día sin clase - ${dayLabel ? `${dayLabel} ` : ""}${date}`;
  }, [noClassDay?.date, dayLabel]);

  /**
   * Barra de acciones contextual según modo edición.
   * 
   * Modo edición: Cancelar/Guardar
   * Modo lectura: Editar/Eliminar
   * Null si no hay datos cargados.
   */
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

  /**
   * Secciones principales del BlocksGrid en dos bloques.
   * 
   * Bloque 1: Header destacado con título y contexto
   * Bloque 2: Detalles editables + información de ficha
   * 
   * Optimizado para evitar re-renders innecesarios.
   */
  const sections = useMemo(() => {
    if (!noClassDay) return [];

    return [
      {
        left: [
          {
            title: "",
            content: (
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

  /**
   * Panel lateral contextual según estado.
   * 
   * Modo edición: Solo nota de guardado
   * Modo lectura: Metadatos del sistema + explicación funcional
   */
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

  // Estados de carga y error
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
