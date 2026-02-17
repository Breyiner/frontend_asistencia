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

/**
 * Página de visualización y edición de programa de formación específico.
 * 
 * Muestra detalles completos de un programa con modo edición inline,
 * estadísticas asociadas y metadatos del sistema.
 * 
 * Características:
 * - Layout de 2 columnas: info principal + adicional
 * - Modo lectura/edición alternable con acciones contextuales
 * - Catálogos dinámicos para edición (niveles, áreas, coordinadores)
 * - Panel lateral con estadísticas y metadatos (solo lectura)
 * - Optimización con useMemo para secciones complejas
 * - Manejo completo de estados loading/saving/errors
 * 
 * Campos editables:
 * - Nombre, duración, nivel, área, coordinador, descripción
 * 
 * Estadísticas mostradas:
 * - Fichas relacionadas
 * - Aprendices inscritos
 * - Trimestres lectivos
 * 
 * Flujo:
 * 1. Carga programa por ID desde URL params
 * 2. Renderiza modo lectura con todas las secciones
 * 3. Usuario activa edición → carga formulario + catálogos
 * 4. Guardado/edición/eliminación con feedback inmediato
 * 
 * @component
 * @returns {JSX.Element} Detalle completo de programa de formación
 */
export default function ProgramShowPage() {
  // Parámetros de ruta y navegación
  const { id } = useParams();
  const navigate = useNavigate();

  /**
   * Hook principal que gestiona lógica CRUD del programa.
   * 
   * Retorna:
   * - program: datos completos del programa
   * - loading: carga inicial
   * - isEditing: modo edición activo
   * - form/errors: formulario de edición
   * - saving: guardado en progreso
   * - startEdit/cancelEdit: toggle modo edición
   * - onChange: handler cambios formulario
   * - save/deleteProgram: acciones principales
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

  // Catálogos para campos editables (solo carga en modo edición)
  const levelsCatalog = useCatalog("qualification_levels");
  const areasCatalog = useCatalog("areas/select");
  const coordinatorsCatalog = useCatalog("users/role/2", { includeEmpty: false });

  /**
   * Secciones principales del BlocksGrid (una sola sección principal).
   * 
   * Izquierda: Campos principales (nombre, duración, nivel, área, coordinador)
   * Derecha: Descripción (textarea en edición)
   * 
   * Contenido condicional según modo edición/lectura.
   * Optimizado con useMemo extenso de dependencias.
   */
  const sections = useMemo(
    () => [
      {
        left: [
          {
            title: "Información del Programa",
            content: isEditing ? (
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
                  select
                />
                <InputField
                  label="Área"
                  name="area_id"
                  value={form.area_id}
                  onChange={onChange}
                  options={areasCatalog.options}
                  disabled={areasCatalog.loading || saving}
                  error={errors.area_id}
                  select
                />
                <InputField
                  label="Coordinador/a"
                  name="coordinator_id"
                  value={form.coordinator_id}
                  onChange={onChange}
                  options={coordinatorsCatalog.options}
                  disabled={coordinatorsCatalog.loading || saving}
                  error={errors.coordinator_id}
                  select
                />
              </>
            ) : (
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
            content: isEditing ? (
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
   * 
   * Modo edición: Solo nota informativa
   * Modo lectura: 
   * - Información del sistema (ID, fechas)
   * - Estadísticas operativas
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
   * Barra de acciones contextual según modo.
   * 
   * Edición: Cancelar/Guardar
   * Lectura: Editar/Eliminar
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
          <Button variant="primary" onClick={startEdit}>
            Editar
          </Button>
          <Button variant="danger" onClick={deleteProgram}>
            Eliminar
          </Button>
        </>
      ),
    [isEditing, saving, cancelEdit, save, startEdit, deleteProgram]
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
