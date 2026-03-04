// =========================================================
// Importaciones de React y React Router
// =========================================================

// useMemo: memoriza estructuras para evitar renders innecesarios
import { useMemo } from "react";

// useNavigate: navegación programática, useParams: params URL
import { useNavigate, useParams } from "react-router-dom";

// =========================================================
// Layout y componentes de UI
// =========================================================

// Layout principal de usuario (header, botón back, acciones)
import UserLayout from "../../components/UserLayout/UserLayout";

// Grid de bloques (izquierda/derecha + side)
import BlocksGrid from "../../components/Blocks/BlocksGrid";

// Fila de información (label/value)
import InfoRow from "../../components/InfoRow/InfoRow";

// Campo de input/select reutilizable
import InputField from "../../components/InputField/InputField";

// Botón reutilizable
import Button from "../../components/Button/Button";

// =========================================================
// Componentes específicos de fichas
// =========================================================

// Lista de trimestres (cards)
import TrimestresList from "../../components/TermList/TermList";

// =========================================================
// Hooks personalizados para gestión de fichas
// =========================================================

// Hook para cargar catálogos (selects)
import useCatalog from "../../hooks/useCatalog";

// Hook principal show/edit de ficha
import useFichaShow from "../../hooks/useFichaShow";

// =========================================================
// Utilidades de autenticación
// =========================================================

// can(): verifica permisos, getCurrentRoleCode(): rol activo
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
  // =========================================================
  // Permisos específicos para operaciones de fichas y trimestres
  // =========================================================

  // Permiso: actualizar ficha
  const canUpdate = can("fichas.update");

  // Permiso: eliminar ficha
  const canDelete = can("fichas.delete");

  // Permiso: asociar trimestre a ficha
  const canCreateTerms = can("ficha_terms.create");

  // Permiso: marcar trimestre como actual
  const canManageTerms = can("ficha_terms.setCurrent");

  // Permiso: editar asociación ficha_term
  const canEditTerms = can("ficha_terms.update");

  // Permiso: eliminar asociación ficha_term
  const canDeleteTerms = can("ficha_terms.delete");

  // Rol activo (ADMIN/COORDINADOR/GESTOR/etc.)
  const roleCode = getCurrentRoleCode();

  // =========================================================
  // Parámetros de ruta y navegación
  // =========================================================

  // Param de la URL: /fichas/:fichaId/...
  const { fichaId } = useParams();

  // Navegación programática
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
   * - saving: estado de guardado/eliminación en progreso
   * - termsBusy: estado de acciones de trimestres (set current / delete term)
   * - startEdit/cancelEdit: alternar modo edición
   * - onChange: handler de cambios de formulario
   * - save: función de guardado
   * - deleteFicha: eliminar ficha
   * - setCurrentTerm/deleteFichaTerm: gestión de trimestres
   */
  const {
    // Data
    ficha,
    loading,

    // UI state
    isEditing,
    form,
    errors,

    // Busy flags
    saving,

    // NUEVO: busy específico de trimestres (debe venir desde useFichaShow)
    termsBusy,

    // Actions
    startEdit,
    cancelEdit,
    onChange,
    save,
    deleteFicha,
    setCurrentTerm,
    deleteFichaTerm,
  } = useFichaShow(fichaId);

  // =========================================================
  // Catálogos para campos select del formulario
  // =========================================================

  // Programas de formación
  const programsCatalog = useCatalog("training_programs/select");

  // Gestores (usuarios con rol gestor fichas)
  const gestorsCatalog = useCatalog("users/role/GESTOR_FICHAS");

  // Estados de ficha (activa/inactiva/etc.)
  const statusCatalog = useCatalog("ficha_statuses");

  // Jornadas/turnos
  const shiftsCatalog = useCatalog("shifts");

  // =========================================================
  // Secciones de BlocksGrid (memoizadas)
  // =========================================================

  /**
   * Secciones principales del BlocksGrid organizadas en layout de 2 columnas.
   *
   * Secciones dinámicas según estado de edición:
   * - Izquierda: Información básica de ficha (número, programa, gestor, jornada)
   * - Derecha: Fechas y estado
   * - Solo lectura: Lista de trimestres con acciones
   *
   * NOTA IMPORTANTE:
   * - Para bloquear la sección de trimestres mientras “hacer actual” está en curso,
   *   se pasa `disabled={termsBusy}` al componente TrimestresList.
   * - Ese disabled debe propagarse hasta CardsSection para aplicar pointer-events: none [web:178].
   */
  const sections = useMemo(
    () => [
      // ----------------------------
      // Bloque principal: información general
      // ----------------------------
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
                  allow="digits"
                  error={errors.ficha_number}
                  disabled={saving} // bloqueo al guardar
                />

                <InputField
                  label="Programa"
                  name="training_program_id"
                  value={form.training_program_id}
                  onChange={onChange}
                  options={programsCatalog.options}
                  disabled={programsCatalog.loading || saving} // bloqueo si catalogo carga o guardando
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

      // ----------------------------
      // Sección de trimestres solo en modo lectura
      // ----------------------------
      !isEditing
        ? {
            left: [
              {
                title: "",
                content: (
                  <TrimestresList
                    // Data
                    trimestres={ficha?.ficha_terms || []}
                    currentId={ficha?.current_ficha_term_id}
                    // Link para asociar (si tiene permiso)
                    associateTo={canCreateTerms ? `/fichas/${fichaId}/ficha_terms/create` : null}
                    // Acciones
                    onEdit={canEditTerms ? (t) => navigate(`/fichas/${fichaId}/ficha_terms/${t.id}/update`) : null}
                    onDelete={canDeleteTerms ? (t) => deleteFichaTerm(t.id) : null}
                    onSetCurrent={canManageTerms ? (t) => setCurrentTerm(t.id) : null}
                    // Horario
                    showSchedule={true}
                    onOpenSchedule={(t) => navigate(`/fichas/${fichaId}/ficha_terms/${t.id}/schedule`)}
                    // NUEVO: deshabilita toda la sección/cards durante acciones de trimestres
                    disabled={termsBusy}
                  />
                ),
              },
            ],
          }
        : null,
    ].filter(Boolean),
    [
      // Dependencias de memo
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
      shiftsCatalog.options,
      shiftsCatalog.loading,
      saving,
      navigate,
      deleteFichaTerm,
      setCurrentTerm,
      canCreateTerms,
      canEditTerms,
      canDeleteTerms,
      canManageTerms,
      roleCode,
      // NUEVO: si cambia termsBusy, debe re-renderizar el memo para bloquear/desbloquear
      termsBusy,
    ],
  );

  // =========================================================
  // Panel lateral (memoizado)
  // =========================================================

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
    [isEditing, ficha],
  );

  // =========================================================
  // Barra de acciones (memoizada)
  // =========================================================

  /**
   * Barra de acciones contextual según estado de edición.
   *
   * Requisito: cuando se ejecuta “hacer actual” (termsBusy),
   * también bloqueamos estos botones para evitar navegación/acciones paralelas.
   */
  const actions = useMemo(
    () =>
      isEditing ? (
        <>
          {canUpdate && (
            <>
              <Button
                variant="secondary"
                onClick={cancelEdit}
                // Se bloquea por saving o por termsBusy (si quieres impedir acciones cruzadas)
                disabled={saving || termsBusy}
              >
                Cancelar
              </Button>

              <Button
                variant="primary"
                onClick={save}
                disabled={saving || termsBusy}
              >
                {saving ? "Guardando..." : "Guardar"}
              </Button>
            </>
          )}
        </>
      ) : (
        <>
          <Button
            variant="secondary"
            onClick={() => navigate(`/fichas/${fichaId}/attendances`)}
            // Bloquea navegación mientras hay operaciones en curso
            disabled={saving || termsBusy}
          >
            Ver Asistencias
          </Button>

          {canUpdate && (
            <Button
              variant="primary"
              onClick={startEdit}
              disabled={saving || termsBusy}
            >
              Editar
            </Button>
          )}

          {canDelete && (
            <Button
              variant="danger"
              onClick={deleteFicha}
              disabled={saving || termsBusy}
            >
              Eliminar
            </Button>
          )}
        </>
      ),
    [
      // deps
      isEditing,
      saving,
      termsBusy,
      cancelEdit,
      save,
      startEdit,
      deleteFicha,
      canUpdate,
      canDelete,
      navigate,
      fichaId,
    ],
  );

  // =========================================================
  // Estados de carga y error
  // =========================================================

  // Loading inicial
  if (loading) return <div>Cargando...</div>;

  // No se encontró
  if (!ficha) return <div>Ficha no encontrada</div>;

  // =========================================================
  // Render principal
  // =========================================================

  return (
    <div className="ficha-show">
      <UserLayout
        // Botón back (lo bloqueamos mientras termsBusy o saving si quieres)
        onBack={() => {
          // Si está procesando, evita navegación accidental
          if (saving || termsBusy) return;
          navigate("/fichas");
        }}
        // Render de acciones superior
        actions={actions}
      >
        <BlocksGrid sections={sections} side={side} />
      </UserLayout>
    </div>
  );
}
