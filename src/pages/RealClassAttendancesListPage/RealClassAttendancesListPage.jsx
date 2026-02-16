// Importaciones de React y React Router
import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";

// Layout y componentes de UI
import UserLayout from "../../components/UserLayout/UserLayout";
import BlocksGrid from "../../components/Blocks/BlocksGrid";
import InfoRow from "../../components/InfoRow/InfoRow";
import Button from "../../components/Button/Button";

// Componentes específicos de asistencias
import AttendanceMiniCard from "../../components/AttendanceMiniCard/AttendanceMiniCard";
import AttendanceEditModal from "../../components/AttendanceEditModal/AttendanceEditModal";

// Hooks personalizados
import useCatalog from "../../hooks/useCatalog";
import useRealClassShow from "../../hooks/useRealClassShow";
import useAttendancesByRealClass from "../../hooks/useAttendancesByRealClass";
import useAttendanceEditModal from "../../hooks/useAttendanceEditModal";

// Estilos
import "../../components/Badge/Badge.css";
import "../RealClassesShowPage/RealClassShowPage.css";
import "./RealClassAttendancesListPage.css";

/**
 * Página de gestión de asistencias de clase real específica.
 * 
 * Interfaz para visualizar, editar y resumir asistencias de
 * una clase programada. Incluye lista de mini-cards clickeables,
 * modal de edición y panel de resumen estadístico.
 * 
 * Características:
 * - Header contextual con programa/ficha/horario
 * - Lista de asistencias por aprendiz (AttendanceMiniCard)
 * - Resumen estadístico por código de estado
 * - Modal de edición inline por asistencia
 * - Recarga manual de datos
 * - Estados de carga diferenciados
 * - Instrucciones de uso en panel lateral
 * 
 * Flujo:
 * 1. Carga clase real por ID
 * 2. Carga asistencias asociadas + resumen
 * 3. Usuario clickea mini-card → abre modal edición
 * 4. Edición actualiza lista y resumen reactivamente
 * 5. Recarga manual disponible
 * 
 * @component
 * @returns {JSX.Element} Lista de asistencias con modal de edición
 */
export default function RealClassAttendancesListPage() {
  // Parámetros de ruta y navegación
  const { realClassId } = useParams();
  const navigate = useNavigate();

  /**
   * Hook para datos de clase real.
   * Retorna: realClass, loading
   */
  const { realClass, loading } = useRealClassShow(realClassId);

  /**
   * Hook para asistencias de la clase real.
   * 
   * Retorna:
   * - attendances/setAttendances: lista editable
   * - summary/setSummary: resumen estadístico
   * - loadingAttendances: carga específica
   * - refetchAttendances: recarga manual
   */
  const {
    attendances,
    setAttendances,
    summary,
    setSummary,
    loadingAttendances,
    refetchAttendances,
  } = useAttendancesByRealClass(realClassId);

  /**
   * Catálogo de estados de asistencia (persistente).
   * keep: true mantiene datos entre recargas.
   */
  const attendanceStatusesCatalog = useCatalog("attendance_statuses", { keep: true });

  /**
   * Transformación de catálogo a formato de estados.
   * 
   * Estructura: [{id, name, code}]
   * code por defecto: "unregistered"
   */
  const statuses = useMemo(() => {
    return (attendanceStatusesCatalog.options || []).map((o) => ({
      id: Number(o.value),
      name: o.label,
      code: o.item?.code || "unregistered",
    }));
  }, [attendanceStatusesCatalog.options]);

  /**
   * Hook del modal de edición de asistencia.
   * 
   * Inicializa con estados y callbacks para actualización reactiva.
   * Retorna: estado modal + handlers + formulario interno.
   */
  const modal = useAttendanceEditModal({
    statuses,
    setAttendances,
    setSummary,
    refetchAttendances,
  });

  /**
   * Secciones principales del BlocksGrid (una sola columna izquierda).
   * 
   * Contenido:
   * 1. Header con contexto de clase (programa, ficha, fecha, horario)
   * 2. Lista de mini-cards o loading/empty states
   * 
   * Estados visuales:
   * - Cargando: mensaje de espera
   * - Vacío: mensaje + botón reintentar
   * - Datos: lista clickeable
   */
  const sections = useMemo(() => {
    if (!realClass) return [];

    const header = (
      <div className="header-real-class">
        <div className="header-real-class__container-title">
          <span className="header-real-class__title">Registro de Asistencias</span>
          <div className="header-real-class__content">
            {realClass.training_program?.name || "—"} - Ficha {realClass.ficha?.number || "—"}
          </div>
          <div className="header-real-class__content">
            {realClass.class_date} | {realClass?.start_hour || "—"} - {realClass?.end_hour || "—"}
          </div>
        </div>
        <Button variant="secondary" onClick={refetchAttendances}>
          Recargar
        </Button>
      </div>
    );

    const list = loadingAttendances ? (
      <div className="loading-attendances">Cargando asistencias...</div>
    ) : attendances?.length ? (
      <div className="attendances-list">
        <h3>Listado de Asistencias</h3>
        {attendances.map((a) => (
          <AttendanceMiniCard key={a.id} attendance={a} onSelect={modal.openModal} />
        ))}
      </div>
    ) : (
      <div className="attendances-empty">
        <p>No hay asistencias registradas para esta clase.</p>
        <Button variant="secondary" onClick={refetchAttendances}>
          Reintentar
        </Button>
      </div>
    );

    return [{ left: [{ title: "", content: header }, { title: "", content: list }] }];
  }, [realClass, attendances, loadingAttendances, refetchAttendances, modal.openModal]);

  /**
   * Panel lateral con información contextual.
   * 
   * Secciones:
   * 1. Detalles básicos (total aprendices)
   * 2. Resumen por estado de asistencia (códigos específicos)
   * 3. Instrucciones de uso del modal
   */
  const side = useMemo(() => {
    if (!realClass) return [];

    const counts = summary?.counts_by_code || {};

    return [
      {
        title: "Detalles",
        variant: "default",
        content: (
          <InfoRow 
            label="Total Aprendices" 
            value={realClass.apprentices_count ?? 0} 
            variant="line"
          />
        ),
      },
      {
        title: "Resumen",
        variant: "default",
        content: (
          <>
            <InfoRow label="Presente" value={counts.present ?? 0} variant="line" />
            <InfoRow label="Ausente" value={counts.absent ?? 0} variant="line"/>
            <InfoRow label="Ausencia Justificada" value={counts.excused_absence ?? 0} variant="line"/>
            <InfoRow label="Tardanza" value={counts.late ?? 0} variant="line"/>
            <InfoRow label="Salida Anticipada" value={counts.early_exit ?? 0} variant="line"/>
            <InfoRow label="Sin Registrar" value={counts.unregistered ?? 0} variant="line"/>
          </>
        ),
      },
      {
        title: "Instrucciones",
        variant: "info-green",
        content: (
          <p>
            Haz clic en cada aprendiz para cambiar su estado de asistencia. Selecciona entre:
            Presente, Ausente, Ausencia Justificada o Salida Anticipada. Recuerda guardar los
            cambios al finalizar.
          </p>
        ),
      },
    ];
  }, [realClass, attendances?.length, summary]);

  // Estados de carga/error iniciales
  if (loading) return <div>Cargando...</div>;
  if (!realClass) return <div>Clase no encontrada</div>;

  return (
    <div className="real-class-show">
      <UserLayout onBack={() => navigate(`/real_classes/${realClassId}`)}>
        <BlocksGrid sections={sections} side={side} />
      </UserLayout>

      {/* Modal de edición de asistencia */}
      <AttendanceEditModal
        open={modal.open}
        onClose={modal.closeModal}
        saving={modal.saving}
        apprenticeName={modal.attendance?.apprentice_full_name || ""}
        statuses={statuses}
        form={modal.form}
        errors={modal.errors}
        rules={modal.rules}
        selectedStatus={modal.selectedStatus}
        onPickStatusId={modal.pickStatusId}
        onChange={modal.onChange}
        onSave={modal.save}
      />
    </div>
  );
}
