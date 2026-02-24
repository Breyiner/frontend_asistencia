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

// Hook personalizado para mostrar/editar área
import useAreaShow from "../../hooks/useAreaShow";

/**
 * Página de visualización y edición detallada de un área específica.
 * 
 * Interfaz dual protegida por permisos Spatie:
 * - areas.view: acceso a vista lectura
 * - areas.update: botón Editar + modo edición
 * - areas.delete: botón Eliminar
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
 * @returns {JSX.Element} Vista completa del área con controles RBAC
 */
export default function AreaShowPage() {
  // ID del área desde parámetros de URL
  const { areaId } = useParams();
  // Navegación programática
  const navigate = useNavigate();

  /**
   * Verificaciones de permisos Spatie para acciones CRUD.
   * Determinan botones disponibles en modo lectura.
   */
  const canUpdate = can("areas.update");
  const canDelete = can("areas.delete");

  /**
   * Hook principal: orquesta datos, formulario y acciones del área.
   * 
   * Proporciona:
   * - area: datos completos + relaciones (training_programs_count)
   * - loading/isEditing/saving/notFound: estados UI
   * - form/errors/onChange: formulario controlado
   * - startEdit/cancelEdit/save/deleteArea: handlers CRUD
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
    notFound,
  } = useAreaShow(areaId);

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
                allow="letters"
                error={errors.name}
                disabled={saving}
                required
              />
            ) : (
              // MODO LECTURA: Nombre actual
              <InfoRow label="Nombre" value={area?.name} />
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
                allow="letters"
                value={form.description}
                onChange={onChange}
                disabled={saving}
                error={errors.description}
              />
            ) : (
              // MODO LECTURA: Descripción con fallback
              <InfoRow 
                label="Descripción" 
                value={area?.description || "Sin descripción"} 
              />
            ),
          },
        ],
      },
    ],
    [isEditing, form, errors, onChange, area, saving]
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
      !isEditing && area ? {
        title: "Información del Sistema",
        variant: "default",
        content: (
          <>
            <InfoRow label="ID" value={area.id} />
            <InfoRow label="Fecha de creación" value={area.created_at} />
            <InfoRow label="Última actualización" value={area.updated_at} />
          </>
        ),
      } : null,

      // Estadísticas de relación (solo lectura)
      !isEditing && area?.training_programs_count != null ? {
        title: "Estadísticas",
        variant: "default",
        content: (
          <InfoRow
            label="Programas de formación asociados"
            value={area.training_programs_count}
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
    [isEditing, area]
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
            <Button variant="danger" onClick={deleteArea} disabled={saving}>
              Eliminar Área
            </Button>
          )}
        </>
      ),
    [isEditing, saving, cancelEdit, save, startEdit, deleteArea, canUpdate, canDelete]
  );

  // Render condicional: estados de carga/error
  if (loading) return <div className="loading">Cargando área...</div>;
  if (notFound) return <div className="not-found">Área no encontrada</div>;
  if (!area) return null;

  return (
    <div className="area-show">
      {/* Layout principal con breadcrumb y acciones */}
      <UserLayout 
        onBack={() => navigate("/areas")} 
        actions={actions}
        title={area.name}
      >
        <BlocksGrid sections={sections} side={side} />
      </UserLayout>
    </div>
  );
}
