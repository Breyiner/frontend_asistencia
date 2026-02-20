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
import useProgramShow from "../../hooks/useProgramShow";

// Utilidades de formato y autenticación
import { can } from "../../utils/auth";

/**
 * Página de visualización y edición de programa de formación específico.
 * 
 * Muestra detalles completos de un programa con modo edición inline,
 * estadísticas asociadas y metadatos del sistema.
 * 
 * Características:
 * - Layout de 2 columnas: info principal + adicional
 * - Modo lectura/edición alternable SOLO con permisos ← NUEVO
 * - Catálogos dinámicos para edición (niveles, áreas, coordinadores)
 * - Panel lateral con estadísticas y metadatos (solo lectura)
 * - PERMISOS: Control granular con `can()` utility ← NUEVO
 * 
 * @component
 * @returns {JSX.Element} Detalle completo de programa de formación
 */
export default function ProgramShowPage() {
  // Parámetros de ruta y navegación
  const { id } = useParams();
  const navigate = useNavigate();

  // ← NUEVO: Permisos usando solo `can()` utility (sin hooks)
  const canEdit = can("training_programs.update");
  const canDelete = can("training_programs.delete");

  /**
   * Hook principal que gestiona lógica CRUD del programa.
   */
  const {
    program,
    loading,
    isEditing,
    form,
    errors,
    saving,
    startEdit,
    cancelEdit,
    onChange,
    save,
    deleteProgram,
  } = useProgramShow(id);

  // Catálogos para campos editables (solo si puede editar)
  const levelsCatalog = useCatalog("qualification_levels", { enabled: canEdit });
  const areasCatalog = useCatalog("areas/select", { enabled: canEdit });
  const coordinatorsCatalog = useCatalog("users/role/COORDINADOR", { 
    enabled: canEdit, 
    includeEmpty: false 
  });

  /**
   * Secciones principales del BlocksGrid (una sola sección principal).
   */
  const sections = useMemo(
    () => [
      {
        left: [
          {
            title: "Información del Programa",
            content: isEditing && canEdit ? ( // ← PROTEGIDO: Solo si puede editar
              <>
                <InputField
                  label="Nombre"
                  name="name"
                  value={form.name}
                  onChange={onChange}
                  error={errors.name}
                  disabled={saving}
                />
                <InputField
                  label="Duración (meses)"
                  name="duration"
                  value={form.duration}
                  onChange={onChange}
                  error={errors.duration}
                  disabled={saving}
                />
                <InputField
                  label="Nivel de Formación"
                  name="qualification_level_id"
                  value={form.qualification_level_id}
                  onChange={onChange}
                  options={levelsCatalog.options}
                  disabled={levelsCatalog.loading || saving}
                  error={errors.qualification_level_id}
                  combo
                />
                <InputField
                  label="Área"
                  name="area_id"
                  value={form.area_id}
                  onChange={onChange}
                  options={areasCatalog.options}
                  disabled={areasCatalog.loading || saving}
                  error={errors.area_id}
                  combo
                />
                <InputField
                  label="Coordinador/a"
                  name="coordinator_id"
                  value={form.coordinator_id}
                  onChange={onChange}
                  options={coordinatorsCatalog.options}
                  disabled={coordinatorsCatalog.loading || saving}
                  error={errors.coordinator_id}
                  combo
                />
              </>
            ) : ( // ← Vista de solo lectura
              <>
                <InfoRow label="Nombre" value={program?.name} />
                <InfoRow label="Duración" value={program?.duration + " meses"} />
                <InfoRow label="Nivel" value={program?.qualification_level_name} />
                <InfoRow label="Área" value={program?.area_name} />
                <InfoRow label="Coordinador" value={program?.coordinator_name} />
              </>
            ),
          },
        ],

        right: [
          {
            title: "Información Adicional",
            content: isEditing && canEdit ? ( // ← PROTEGIDO: Solo si puede editar
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
              <InfoRow label="Descripción" value={program?.description} />
            ),
          },
        ],
      },
    ],
    [
      isEditing,
      canEdit,
      form,
      errors,
      onChange,
      program,
      levelsCatalog.options,
      levelsCatalog.loading,
      areasCatalog.options,
      areasCatalog.loading,
      coordinatorsCatalog.options,
      coordinatorsCatalog.loading,
      saving,
    ]
  );

  /**
   * Panel lateral con contenido condicional.
   */
  const side = useMemo(
    () => [
      !isEditing && program
        ? {
            title: "Información Sistema",
            variant: "default",
            content: (
              <>
                <InfoRow label="ID" value={program.id} />
                <InfoRow label="Fecha registro" value={program.created_at} />
                <InfoRow label="Última actualización" value={program.updated_at} />
              </>
            ),
          }
        : null,

      !isEditing && program
        ? {
            title: "Estadísticas",
            variant: "default",
            content: (
              <>
                <InfoRow label="Fichas Relacionadas" value={program.fichas_count} />
                <InfoRow label="Aprendices Inscritos" value={program.apprentices_count} />
                <InfoRow label="Trimestres Lectiva" value={program?.trimesters_lective} />
              </>
            ),
          }
        : null,
      {
        title: "Nota",
        variant: "info",
        content: <p>Los cambios realizados se guardarán automáticamente en el sistema</p>,
      },
    ].filter(Boolean),
    [isEditing, program]
  );

  /**
   * Barra de acciones contextual según modo Y permisos. 
   */
  const actions = useMemo(
    () =>
      isEditing ? (
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
          {/* ← Botón Editar solo si tiene permiso */}
          {canEdit && (
            <Button variant="primary" onClick={startEdit} disabled={saving}>
              Editar
            </Button>
          )}
          {/* ← Botón Eliminar solo si tiene permiso */}
          {canDelete && (
            <Button variant="danger" onClick={deleteProgram} disabled={saving}>
              Eliminar
            </Button>
          )}
        </>
      ),
    [isEditing, saving, cancelEdit, save, startEdit, deleteProgram, canEdit, canDelete] 
  );

  // Estados de carga/error
  if (loading) return <div>Cargando...</div>;
  if (!program) return <div>No encontrado</div>;

  return (
    <div className="program-show">
      <UserLayout onBack={() => navigate("/training_programs")} actions={actions}>
        <BlocksGrid sections={sections} side={side} />
      </UserLayout>
    </div>
  );
}
