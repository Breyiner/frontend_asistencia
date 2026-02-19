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

// Utilidades de autenticación
import { can } from "../../utils/auth";

// Hook personalizado para mostrar/editar ambiente
import useClassroomShow from "../../hooks/useClassroomShow";

/**
 * Página de visualización y edición detallada de un ambiente específico.
 * 
 * Interfaz dual protegida por permisos Spatie:
 * - classrooms.view: acceso a vista lectura
 * - classrooms.update: botón Editar + modo edición
 * - classrooms.delete: botón Eliminar
 * 
 * Características:
 * - Layout BlocksGrid responsive (2 columnas + sidebar)
 * - Campos: nombre (requerido), descripción (textarea)
 * - Sidebar dinámico: metadatos + estadísticas (conteo programas)
 * - Validación en tiempo real con errores inline
 * - Estados loading/notFound manejados
 * 
 * Flujo por permisos:
 * 1. Usuario con view accede → modo lectura
 * 2. Si update → "Editar" → formulario controlado
 * 3. Si delete → botón Eliminar disponible
 * 4. Guardado automático con feedback visual
 * 
 * @component
 * @returns {JSX.Element} Vista completa del ambiente con controles RBAC
 */
export default function ClassroomShowPage() {
  // ID del ambiente desde parámetros de URL
  const { classroomId } = useParams();
  // Navegación programática
  const navigate = useNavigate();

  /**
   * Verificaciones de permisos Spatie para acciones CRUD.
   * Determinan botones disponibles en modo lectura.
   */
  const canUpdate = can("classrooms.update");
  const canDelete = can("classrooms.delete");

  /**
   * Hook principal: orquesta datos, formulario y acciones del ambiente.
   * 
   * Proporciona:
   * - classroom: datos completos + relaciones (training_programs_count)
   * - loading/isEditing/saving/notFound: estados UI
   * - form/errors/onChange: formulario controlado
   * - startEdit/cancelEdit/save/deleteClassroom: handlers CRUD
   */
  const {
    classroom,
    loading,
    isEditing,
    form,
    errors,
    saving,
    startEdit,
    cancelEdit,
    onChange,
    save,
    deleteClassroom,
    notFound,
  } = useClassroomShow(classroomId);

  /**
   * Secciones principales del BlocksGrid (layout 2 columnas).
   * 
   * Dinámico por modo:
   * - Lectura: InfoRow con datos actuales
   * - Edición: InputField con formulario
   * 
   * Optimizado con useMemo para performance.
   */
  const sections = useMemo(
    () => [
      {
        // Columna izquierda: Información principal
        left: [
          {
            title: "Información Principal",
            content: isEditing ? (
              // MODO EDICIÓN: Formulario nombre
              <InputField
                label="Nombre *"
                name="name"
                value={form.name}
                onChange={onChange}
                error={errors.name}
                disabled={saving}
                required
              />
            ) : (
              // MODO LECTURA: Nombre actual
              <InfoRow label="Nombre" value={classroom?.name} />
            ),
          },
        ],
        // Columna derecha: Descripción detallada
        right: [
          {
            title: "Descripción",
            content: isEditing ? (
              // MODO EDICIÓN: Textarea expandible
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
              // MODO LECTURA: Descripción con fallback
              <InfoRow 
                label="Descripción" 
                value={classroom?.description || "Sin descripción"} 
              />
            ),
          },
        ],
      },
    ],
    [isEditing, form, errors, onChange, classroom, saving]
  );

  /**
   * Panel lateral (sidebar) con información contextual.
   * 
   * Contenido condicional por modo:
   * - Lectura: ID, timestamps, estadísticas programas
   * - Siempre: nota de guardado automático
   */
  const side = useMemo(
    () => [
      // Metadatos del sistema (solo lectura)
      !isEditing && classroom ? {
        title: "Información del Sistema",
        variant: "default",
        content: (
          <>
            <InfoRow label="ID" value={classroom.id} />
            <InfoRow label="Fecha de creación" value={classroom.created_at} />
            <InfoRow label="Última actualización" value={classroom.updated_at} />
          </>
        ),
      } : null,

      // Estadísticas de relación (solo lectura)
      !isEditing && classroom?.training_programs_count != null ? {
        title: "Estadísticas",
        variant: "default",
        content: (
          <InfoRow
            label="Programas de formación asociados"
            value={classroom.training_programs_count}
          />
        ),
      } : null,

      // Nota informativa permanente
      {
        title: "Nota",
        variant: "info",
        content: (
          <p>Los cambios se guardan automáticamente al hacer clic en "Guardar".</p>
        ),
      },
    ].filter(Boolean), // Limpia elementos nulos
    [isEditing, classroom]
  );

  /**
   * Barra de acciones contextual por modo y permisos.
   * 
   * MODO LECTURA: Editar (si puede) / Eliminar (si puede)
   * MODO EDICIÓN: Cancelar / Guardar (siempre visible)
   */
  const actions = useMemo(
    () =>
      isEditing ? (
        // MODO EDICIÓN: Controles de formulario
        <>
          <Button variant="secondary" onClick={cancelEdit} disabled={saving}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={save} disabled={saving}>
            {saving ? "Guardando..." : "Guardar Cambios"}
          </Button>
        </>
      ) : (
        // MODO LECTURA: Acciones por permisos
        <>
          {canUpdate && (
            <Button variant="primary" onClick={startEdit} disabled={saving}>
              Editar
            </Button>
          )}
          {canDelete && (
            <Button variant="danger" onClick={deleteClassroom} disabled={saving}>
              Eliminar Ambiente
            </Button>
          )}
        </>
      ),
    [isEditing, saving, cancelEdit, save, startEdit, deleteClassroom, canUpdate, canDelete]
  );

  // Render condicional: estados de carga/error
  if (loading) return <div className="loading">Cargando ambiente...</div>;
  if (notFound) return <div className="not-found">Ambiente no encontrado</div>;
  if (!classroom) return null;

  return (
    <div className="classroom-show">
      {/* Layout principal con breadcrumb y acciones */}
      <UserLayout 
        onBack={() => navigate("/classrooms")} 
        actions={actions}
        title={classroom.name}
      >
        <BlocksGrid sections={sections} side={side} />
      </UserLayout>
    </div>
  );
}
