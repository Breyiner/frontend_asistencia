// Importaciones de React y React Router
import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";

// Layout y componentes de UI
import UserLayout from "../../components/UserLayout/UserLayout";
import BlocksGrid from "../../components/Blocks/BlocksGrid";
import InfoRow from "../../components/InfoRow/InfoRow";
import InputField from "../../components/InputField/InputField";
import Button from "../../components/Button/Button";

// Componentes específicos de fichas
import TrimestresList from "../../components/TermList/TermList";

// Hooks personalizados para gestión de fichas
import useCatalog from "../../hooks/useCatalog";
import useFichaShow from "../../hooks/useFichaShow";

// Utilidades de autenticación
import { can, getCurrentRoleCode } from "../../utils/auth";

/**
 * Página de visualización y edición de una ficha específica.
 * 
 * Muestra información detallada de una ficha de formación con capacidades
 * de edición condicional según permisos de usuario. Incluye gestión
 * de trimestres asociados y estadísticas del sistema.
 * 
 * Características:
 * - Visualización en modo lectura con filas informativas
 * - Edición inline con formularios controlados
 * - Gestión de trimestres (crear, editar, eliminar, establecer actual)
 * - Controles de permisos granulares por rol
 * - Catálogos dinámicos para selects (programas, gestores, estados, jornadas)
 * - Panel lateral con estadísticas y metadatos del sistema
 * - Acciones contextuales según estado de edición
 * 
 * Flujo:
 * 1. Carga datos de ficha específica por ID desde URL
 * 2. Verifica permisos de usuario para mostrar controles
 * 3. Renderiza layout de bloques con información dividida en secciones
 * 4. Maneja alternancia entre modo vista/edición
 * 5. Procesa guardado automático y navegación a sub-páginas
 * 
 * @component
 * @returns {JSX.Element} Página completa de detalle de ficha
 */
export default function FichaShowPage() {
  // Permisos específicos para operaciones de fichas y trimestres
  const canUpdate = can("fichas.update");
  const canDelete = can("fichas.delete");
  const canCreateTerms = can("ficha_terms.create");
  const canManageTerms = can("ficha_terms.setCurrent");
  const canEditTerms = can("ficha_terms.update");
  const canDeleteTerms = can("ficha_terms.delete");
  const roleCode = getCurrentRoleCode();

  // Parámetros de ruta y navegación
  const { fichaId } = useParams();
  const navigate = useNavigate();

  /**
   * Hook principal que gestiona toda la lógica de la ficha.
   * 
   * Retorna:
   * - ficha: datos completos de la ficha
   * - loading: estado de carga inicial
   * - isEditing: estado de modo edición
   * - form: valores del formulario
   * - errors: errores de validación
   * - saving: estado de guardado en progreso
   * - startEdit/cancelEdit: alternar modo edición
   * - onChange: handler de cambios de formulario
   * - save: función de guardado
   * - deleteFicha: eliminar ficha
   * - setCurrentTerm/deleteFichaTerm: gestión de trimestres
   */
  const {
    ficha,
    loading,
    isEditing,
    form,
    errors,
    saving,
    startEdit,
    cancelEdit,
    onChange,
    save,
    deleteFicha,
    setCurrentTerm,
    deleteFichaTerm,
  } = useFichaShow(fichaId);

  // Catálogos para campos select del formulario
  const programsCatalog = useCatalog("training_programs/select");
  const gestorsCatalog = useCatalog("users/role/GESTOR_FICHAS");
  const statusCatalog = useCatalog("ficha_statuses");
  const shiftsCatalog = useCatalog("shifts");

  /**
   * Secciones principales del BlocksGrid organizadas en layout de 2 columnas.
   * 
   * Secciones dinámicas según estado de edición:
   * - Izquierda: Información básica de ficha (número, programa, gestor, jornada)
   * - Derecha: Fechas y estado
   * - Solo lectura: Lista de trimestres con acciones
   * 
   * Optimizado con useMemo para evitar re-renders innecesarios.
   */
  const sections = useMemo(
    () => [
      {
        left: [
          {
            title: "Información de la Ficha",
            content: isEditing ? (
              <>
                <InputField
                  label="Número de Ficha"
                  name="ficha_number"
                  value={form.ficha_number}
                  onChange={onChange}
                  error={errors.ficha_number}
                  disabled={saving}
                />
                <InputField
                  label="Programa"
                  name="training_program_id"
                  value={form.training_program_id}
                  onChange={onChange}
                  options={programsCatalog.options}
                  disabled={programsCatalog.loading || saving}
                  error={errors.training_program_id}
                  combo
                />
                {/* Gestor: solo admin puede cambiar, gestor ve su nombre fijo */}
                {roleCode === "ADMIN" ? (
                  <InputField
                    label="Gestor"
                    name="gestor_id"
                    value={form.gestor_id}
                    onChange={onChange}
                    options={gestorsCatalog.options}
                    disabled={gestorsCatalog.loading || saving}
                    error={errors.gestor_id}
                    combo
                  />
                ) : (
                  <></>
                )}
                <InputField
                  label="Jornada"
                  name="shift_id"
                  value={form.shift_id}
                  onChange={onChange}
                  options={shiftsCatalog.options}
                  disabled={shiftsCatalog.loading || saving}
                  error={errors.shift_id}
                  combo
                />
              </>
            ) : (
              <>
                <InfoRow label="Número de Ficha" value={ficha?.ficha_number} />
                <InfoRow label="Programa" value={ficha?.training_program_name} />
                <InfoRow label="Gestor" value={ficha?.gestor_name} />
                <InfoRow label="Jornada" value={ficha?.shift_name} />
              </>
            ),
          },
        ],
        right: [
          {
            title: "Fechas y Estado",
            content: isEditing ? (
              <>
                <InputField
                  label="Fecha Inicio"
                  name="start_date"
                  type="date"
                  value={form.start_date}
                  onChange={onChange}
                  error={errors.start_date}
                  disabled={saving}
                />
                <InputField
                  label="Fecha Fin"
                  name="end_date"
                  type="date"
                  value={form.end_date}
                  onChange={onChange}
                  error={errors.end_date}
                  disabled={saving}
                />
                <InputField
                  label="Estado"
                  name="status_id"
                  value={form.status_id}
                  onChange={onChange}
                  options={statusCatalog.options}
                  disabled={statusCatalog.loading || saving}
                  error={errors.status_id}
                  combo
                />
              </>
            ) : (
              <>
                <InfoRow label="Fecha Inicio" value={ficha?.start_date} />
                <InfoRow label="Fecha Fin" value={ficha?.end_date} />
                <InfoRow label="Estado" value={ficha?.status_name} />
              </>
            ),
          },
        ],
      },

      // Sección de trimestres solo en modo lectura
      !isEditing
        ? {
            left: [
              {
                title: "",
                content: (
                  <TrimestresList
                    trimestres={ficha?.ficha_terms || []}
                    currentId={ficha?.current_ficha_term_id}
                    associateTo={canCreateTerms ? `/fichas/${fichaId}/ficha_terms/create` : null}
                    onEdit={canEditTerms ? (t) => navigate(`/fichas/${fichaId}/ficha_terms/${t.id}/update`) : null}
                    onDelete={canDeleteTerms ? (t) => deleteFichaTerm(t.id) : null}
                    onSetCurrent={canManageTerms ? (t) => setCurrentTerm(t.id) : null}
                    showSchedule={true}
                    onOpenSchedule={(t) => navigate(`/fichas/${fichaId}/ficha_terms/${t.id}/schedule`)}
                  />
                ),
              },
            ],
          }
        : null,
    ].filter(Boolean),
    [
      fichaId,
      isEditing,
      form,
      errors,
      onChange,
      ficha,
      programsCatalog.options,
      programsCatalog.loading,
      gestorsCatalog.options,
      gestorsCatalog.loading,
      statusCatalog.options,
      statusCatalog.loading,
      saving,
      navigate,
      deleteFichaTerm,
      setCurrentTerm,
      canManageTerms,
      roleCode,
    ]
  );

  /**
   * Panel lateral con información complementaria.
   * 
   * Contenido condicional según estado:
   * - Estadísticas (total aprendices)
   * - Información del sistema (ID, fechas, trimestre actual)
   * - Nota informativa sobre guardado automático
   */
  const side = useMemo(
    () => [
      // Estadísticas de aprendices
      !isEditing && ficha
        ? {
            title: "Estadísticas",
            variant: "default",
            content: (
              <>
                <InfoRow label="Total Aprendices" value={ficha.apprentices_count} />
              </>
            ),
          }
        : null,

      // Metadatos del sistema
      !isEditing && ficha
        ? {
            title: "Información Sistema",
            variant: "default",
            content: (
              <>
                <InfoRow label="ID" value={ficha.id} />
                <InfoRow label="Fecha registro" value={ficha.created_at} />
                <InfoRow label="Fecha Actualización" value={ficha.updated_at} />
                <InfoRow label="Trimestre Actual" value={ficha.current_term_name || "Ninguno"} />
              </>
            ),
          }
        : null,

      // Nota informativa permanente
      {
        title: "Nota",
        variant: "info",
        content: <p>Los cambios se guardarán automáticamente</p>,
      },
    ].filter(Boolean),
    [isEditing, ficha]
  );

  /**
   * Barra de acciones contextual según estado de edición.
   * 
   * Modo edición: Cancelar/Guardar
   * Modo lectura: Ver Asistencias/Editar/Eliminar
   */
  const actions = useMemo(
    () =>
      isEditing ? (
        <>
          {canUpdate && (
            <>
              <Button variant="secondary" onClick={cancelEdit} disabled={saving}>
                Cancelar
              </Button>
              <Button variant="primary" onClick={save} disabled={saving}>
                {saving ? "Guardando..." : "Guardar"}
              </Button>
            </>
          )}
        </>
      ) : (
        <>
          <Button variant="secondary" onClick={() => navigate(`/fichas/${fichaId}/attendances`)} disabled={saving}>
            Ver Asistencias
          </Button>
          {canUpdate && (
            <Button variant="primary" onClick={startEdit} disabled={saving}>
              Editar
            </Button>
          )}
          {canDelete && (
            <Button variant="danger" onClick={deleteFicha} disabled={saving}>
              Eliminar
            </Button>
          )}
        </>
      ),
    [isEditing, saving, cancelEdit, save, startEdit, deleteFicha, canUpdate, canDelete]
  );

  // Estados de carga y error
  if (loading) return <div>Cargando...</div>;
  if (!ficha) return <div>Ficha no encontrada</div>;

  return (
    <div className="ficha-show">
      <UserLayout onBack={() => navigate("/fichas")} actions={actions}>
        <BlocksGrid sections={sections} side={side} />
      </UserLayout>
    </div>
  );
}
