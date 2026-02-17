// Hook de React para memoización
import { useMemo } from "react";
// Hooks de React Router para parámetros y navegación
import { useNavigate, useParams } from "react-router-dom";

// Componentes de layout y formulario
import UserLayout from "../../components/UserLayout/UserLayout";
import BlocksGrid from "../../components/Blocks/BlocksGrid";
import InfoRow from "../../components/InfoRow/InfoRow";
import InputField from "../../components/InputField/InputField";
import Button from "../../components/Button/Button";

// Hook personalizado para mostrar/editar área
import useAreaShow from "../../hooks/useAreaShow";

/**
 * Componente para visualizar y editar información completa de un área.
 * 
 * Vista dual: lectura (InfoRow) / edición (InputField).
 * Incluye estadísticas y metadatos del sistema.
 * 
 * Características:
 * - Modo lectura/edición alternable
 * - Campos: nombre, descripción
 * - Sidebar con ID, fechas y estadísticas
 * - Acciones CRUD completas
 * - Manejo de estados loading/notFound
 * 
 * Flujo:
 * 1. Carga área por ID desde params
 * 2. Muestra en modo lectura
 * 3. Usuario puede editar/guardar/cancelar
 * 4. Opcional: eliminar área
 * 
 * @component
 * @returns {JSX.Element} Vista completa del área (lectura/edición)
 */
export default function AreaShowPage() {
  // ID del área desde URL params
  const { areaId } = useParams();
  // Hook para navegación programática
  const navigate = useNavigate();

  /**
   * Hook principal que gestiona datos y acciones del área.
   * 
   * Retorna:
   * - area: datos completos del área
   * - loading: carga inicial
   * - isEditing: modo edición
   * - form/errors/saving: formulario
   * - startEdit/cancelEdit/save/deleteArea: acciones CRUD
   * - notFound: área no existe
   */
  const {
    area,
    loading,
    isEditing,
    form,
    errors,
    saving,
    startEdit,
    cancelEdit,
    onChange,
    save,
    deleteArea,
    notFound
  } = useAreaShow(areaId);

  /**
   * Secciones del BlocksGrid calculadas dinámicamente.
   * 
   * Cambian según modo edición/lectura.
   * Left: nombre | Right: descripción.
   */
  const sections = useMemo(
    () => [
      {
        // Columna izquierda: Información principal
        left: [
          {
            title: "Información del Área",
            content: isEditing ? (
              // MODO EDICIÓN: campo nombre
              <>
                <InputField
                  label="Nombre"
                  name="name"
                  value={form.name}
                  onChange={onChange}
                  error={errors.name}
                  disabled={saving}
                />
              </>
            ) : (
              // MODO LECTURA: nombre
              <>
                <InfoRow label="Nombre" value={area?.name} />
              </>
            ),
          },
        ],
        // Columna derecha: descripción
        right: [
          {
            title: "Descripción",
            content: isEditing ? (
              // MODO EDICIÓN: textarea descripción
              <InputField
                label="Descripción"
                name="description"
                textarea
                rows={4}
                value={form.description}
                onChange={onChange}
                disabled={saving}
                error={errors.description}
              />
            ) : (
              // MODO LECTURA: descripción con fallback
              <>
                <InfoRow label="Descripción" value={area?.description || "Sin descripción"} />
              </>
            ),
          },
        ],
      },
    ],
    [isEditing, form, errors, onChange, area, saving]
  );

  /**
   * Elementos laterales (sidebar) calculados dinámicamente.
   * 
   * Muestra metadatos y estadísticas solo en modo lectura.
   */
  const side = useMemo(
    () =>
      [
        // Info sistema (ID, fechas)
        !isEditing && area
          ? {
              title: "Información Sistema",
              variant: "default",
              content: (
                <>
                  <InfoRow label="ID" value={area.id} />
                  <InfoRow label="Fecha registro" value={area.created_at} />
                  <InfoRow label="Última actualización" value={area.updated_at} />
                </>
              ),
            }
          : null,

        // Estadísticas (conteo programas) si disponible
        !isEditing && area?.training_programs_count != null
          ? {
              title: "Estadísticas",
              variant: "default",
              content: (
                <>
                  <InfoRow
                    label="Programas de formación"
                    value={area.training_programs_count}
                  />
                </>
              ),
            }
          : null,

        // Nota informativa permanente
        {
          title: "Nota",
          variant: "info",
          content: <p>Los cambios realizados se guardarán automáticamente en el sistema</p>,
        },
      ].filter(Boolean), // Elimina elementos null
    [isEditing, area]
  );

  /**
   * Acciones dinámicas según modo edición/lectura.
   */
  const actions = useMemo(
    () =>
      isEditing ? (
        // MODO EDICIÓN: Cancelar/Guardar
        <>
          <Button variant="secondary" onClick={cancelEdit} disabled={saving}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={save} disabled={saving}>
            {saving ? "Guardando..." : "Guardar"}
          </Button>
        </>
      ) : (
        // MODO LECTURA: Editar/Eliminar
        <>
          <Button variant="primary" onClick={startEdit}>
            Editar
          </Button>
          <Button variant="danger" onClick={deleteArea}>
            Eliminar
          </Button>
        </>
      ),
    [isEditing, saving, cancelEdit, save, startEdit, deleteArea]
  );

  // Estados de carga/error
  if (loading) return <div>Cargando...</div>;
  if (notFound) return <div>No encontrado</div>;
  if (!area) return null;

  return (
    <div className="area-show">
      {/* Layout principal con acciones dinámicas */}
      <UserLayout onBack={() => navigate("/areas")} actions={actions}>
        <BlocksGrid sections={sections} side={side} />
      </UserLayout>
    </div>
  );
}
