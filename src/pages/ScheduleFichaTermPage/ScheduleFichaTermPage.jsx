// Importaciones de React
import { useMemo } from "react"; // Memoización para secciones y paneles complejos

// React Router para parámetros y navegación
import { useNavigate, useParams } from "react-router-dom"; // ID de URL y navegación

// Layout y componentes informativos
import UserLayout from "../../components/UserLayout/UserLayout"; // Layout con back button
import BlocksGrid from "../../components/Blocks/BlocksGrid"; // Grid responsive 2 columnas
import InfoRow from "../../components/InfoRow/InfoRow"; // Fila de información solo lectura
import ScheduleSessionsList from "../../components/ScheduleSessionList/ScheduleSessionList"; // Lista de sesiones planificadas

// Hooks personalizados para datos específicos
import useFichaShow from "../../hooks/useFichaShow"; // Datos de ficha padre
import useFichaTermSchedule from "../../hooks/useFichaTermSchedule"; // Horario completo del trimestre
import { can } from "../../utils/auth"; // Verificación de permisos granulares

// Estilos específicos
import "./ScheduleFichaTermPage.css"; // CSS propio de la página

/**
 * Página de visualización de horario de trimestre específico de ficha.
 * 
 * Muestra horario completo (sesiones planificadas) de un trimestre/fase
 * con permisos contextuales para crear/editar/eliminar sesiones.
 * 
 * Características:
 * - Header dinámico con ficha/programa/trimestre/fase
 * - Lista de sesiones con acciones según permisos
 * - Panel lateral con resumen contextual + metadatos
 * - Loadings diferenciados (ficha vs horario)
 * - Sin edición inline (solo navegación a sub-páginas)
 * - UX de solo lectura con acciones delegadas
 * 
 * Flujo:
 * 1. Carga ficha (contexto) + horario del trimestre
 * 2. Renderiza header con datos combinados (ficha + trimestre)
 * 3. Lista de sesiones con botones condicionales
 * 4. Panel con resumen operativo + info sistema
 * 
 * @component
 * @returns {JSX.Element} Horario completo de trimestre con lista de sesiones
 */
export default function ScheduleFichaTermPage() {
  // IDs de ruta: ficha y trimestre específicos
  const { fichaId, fichaTermId } = useParams();
  // Navegación programática
  const navigate = useNavigate();

  /**
   * Permisos granulares para acciones de sesiones.
   * Verifica cada operación por separado.
   */
  const canCreateSession = can("schedule_sessions.create"); // Crear nueva sesión
  const canUpdateSession = can("schedule_sessions.update"); // Editar sesión existente
  const canDeleteSession = can("schedule_sessions.delete"); // Eliminar sesión

  /**
   * Hook de ficha padre (contexto general).
   * Proporciona: ficha, loading específico (fichaLoading)
   */
  const { ficha, loading: fichaLoading } = useFichaShow(fichaId);

  /**
   * Hook principal de horario del trimestre.
   * 
   * Proporciona:
   * - schedule: objeto completo (ficha, term, phase, sessions, dates)
   * - loading: loading específico del horario
   * - deleteSession: elimina sesión específica por ID
   */
  const {
    schedule,           // Horario completo embebido
    loading: scheduleLoading, // Loading del horario
    deleteSession,      // Acción de eliminación directa
  } = useFichaTermSchedule({ fichaTermId }); // Inicializa con ID trimestre

  /**
   * Loading combinado: true si cualquiera está cargando.
   * Mejora UX mostrando spinner hasta datos completos.
   */
  const loading = fichaLoading || scheduleLoading;

  /**
   * Secciones principales del BlocksGrid (2 bloques).
   * 
   * Bloque 1: Header destacado (solo izquierda)
   * Bloque 2: Lista de sesiones (solo izquierda)
   */
  const sections = useMemo(
    () => [
      {
        // Bloque 1: Header contextual prominente
        left: [
          {
            title: "", // Sin título de sección
            content: (
              <div className="schedule-head"> {/* Contenedor visual destacado */}
                <div className="schedule-head__text">
                  {/* Título principal con número de ficha */}
                  <h2 className="schedule-head__title">
                    Horario Ficha{" "}
                    {schedule?.ficha?.number ?? ficha?.ficha_number ?? ""} {/* Prioridad: schedule → ficha → vacío */}
                  </h2>

                  {/* Subtítulo: programa • trimestre • fase */}
                  <div className="schedule-head__subtitle">
                    <span>{schedule?.ficha?.training_program_name ?? ficha?.training_program_name ?? ""}</span>
                    <span className="schedule-head__dot">•</span> {/* Separador visual */}
                    <span>{schedule?.term?.name ?? ""}</span> {/* Nombre trimestre */}
                    <span className="schedule-head__dot">•</span>
                    <span>{schedule?.phase?.name ?? ""}</span> {/* Nombre fase */}
                  </div>
                </div>
              </div>
            ),
          },
        ],
      },

      {
        // Bloque 2: Lista principal de sesiones
        left: [
          {
            title: "", // Sin título de sección
            content: (
              <ScheduleSessionsList
                sessions={schedule?.sessions || []} // Array de sesiones o vacío
                associateTo={
                  // Ruta de creación (solo si permiso)
                  canCreateSession
                    ? `/fichas/${fichaId}/ficha_terms/${fichaTermId}/schedule/${schedule?.id}/session/create`
                    : null
                }
                onEdit={
                  // Callback de edición (solo si permiso)
                  canUpdateSession
                    ? (s) =>
                        navigate( // Navega a página de edición específica
                          `/fichas/${fichaId}/ficha_terms/${fichaTermId}/schedule/${schedule?.id}/session/${s.id}/update`,
                        )
                    : null
                }
                onDelete={canDeleteSession ? (s) => deleteSession(s.id) : null} // Elimina directo
              />
            ),
          },
        ],
      },
    ],
    [
      // Dependencias extensas para optimización
      schedule,           // Horario completo
      ficha,             // Ficha de contexto
      fichaId,           // ID ficha (URL)
      fichaTermId,       // ID trimestre (URL)
      navigate,          // Función navegación
      deleteSession,     // Función eliminar
      canCreateSession,  // Permiso crear
      canUpdateSession,  // Permiso editar
      canDeleteSession,  // Permiso eliminar
    ],
  );

  /**
   * Panel lateral con 3 secciones condicionales.
   * 
   * 1. Resumen: ficha/trimestre/fase/periodo/jornada
   * 2. Info adicional: ID/fechas del horario
   * 3. Nota fija informativa
   */
  const side = useMemo(() => {
    /**
     * Sección 1: Resumen operativo (solo si schedule existe).
     * Combina datos de schedule y ficha.
     */
    const resumen = schedule
      ? {
          title: "Resumen:", // Título abreviado
          variant: "default",
          content: (
            <>
              <InfoRow
                label="Ficha"
                value={schedule?.ficha?.number ?? ficha?.ficha_number} // Prioridad schedule → ficha
              />
              <InfoRow label="Trimestre" value={schedule?.term?.name ?? "—"} />
              <InfoRow label="Fase" value={schedule?.phase?.name ?? "—"} />
              <InfoRow
                label="Periodo"
                value={
                  schedule?.term_dates?.start_date && schedule?.term_dates?.end_date
                    ? `${schedule.term_dates.start_date} - ${schedule.term_dates.end_date}` // Rango formateado
                    : "—"
                }
              />
              <InfoRow
                label="Jornada"
                value={ficha?.shift_name ?? "—"} // Jornada de la ficha
              />
            </>
          ),
        }
      : null;

    /**
     * Sección 2: Metadatos técnicos del horario.
     */
    const infoAdicional = schedule
      ? {
          title: "Información Adicional",
          variant: "default",
          content: (
            <>
              <InfoRow label="ID" value={schedule.id} />
              <InfoRow label="Fecha registro" value={schedule.created_at} />
              <InfoRow
                label="Última actualización"
                value={schedule.updated_at}
              />
            </>
          ),
        }
      : null;

    /**
     * Sección 3: Nota informativa fija.
     */
    const nota = {
      title: "Nota",
      variant: "info",
      content: (
        <p>Los cambios realizados se guardarán automáticamente en el sistema</p>
      ),
    };

    // Combina y filtra secciones nulas
    return [resumen, infoAdicional, nota].filter(Boolean);
  }, [schedule, ficha]); // Dependencias del panel

  /**
   * Actions vacío explícito (sin barra de acciones).
   * Solo back button en UserLayout.
   */
  const actions = useMemo(() => <></>, []); // Fragmento vacío

  /**
   * Early returns por estado crítico (prioridad loading → ficha → schedule).
   */
  if (loading) return <div>Cargando...</div>; // Loading combinado
  if (!ficha) return <div>Ficha no encontrada</div>; // Contexto faltante
  if (!schedule) return <div>Horario no encontrado</div>; // Horario específico ausente

  return (
    <div className="schedule-ficha-term"> {/* Contenedor con estilos específicos */}
      <UserLayout
        onBack={() => navigate(`/fichas/${fichaId}`)} // Regresa a ficha específica
        actions={actions}                            // Sin acciones adicionales
      >
        <BlocksGrid sections={sections} side={side} /> {/* Grid principal + panel */}
      </UserLayout>
    </div>
  );
}
