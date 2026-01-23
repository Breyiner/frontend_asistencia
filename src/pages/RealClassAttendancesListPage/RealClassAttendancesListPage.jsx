import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";

import UserLayout from "../../components/UserLayout/UserLayout";
import BlocksGrid from "../../components/Blocks/BlocksGrid";
import InfoRow from "../../components/InfoRow/InfoRow";
import Button from "../../components/Button/Button";

import useCatalog from "../../hooks/useCatalog";
import useRealClassShow from "../../hooks/useRealClassShow";
import useAttendancesByRealClass from "../../hooks/useAttendancesByRealClass";
import useAttendanceEditModal from "../../hooks/useAttendanceEditModal";

import AttendanceMiniCard from "../../components/AttendanceMiniCard/AttendanceMiniCard";
import AttendanceEditModal from "../../components/AttendanceEditModal/AttendanceEditModal";

import "../../components/Badge/Badge.css";
import "../RealClassesShowPage/RealClassShowPage.css";
import "./RealClassAttendancesListPage.css";

export default function RealClassAttendancesListPage() {
  const { realClassId } = useParams();
  const navigate = useNavigate();

  const { realClass, loading } = useRealClassShow(realClassId);

  const {
    attendances,
    setAttendances,
    summary,
    setSummary,
    loadingAttendances,
    refetchAttendances,
  } = useAttendancesByRealClass(realClassId);

  const attendanceStatusesCatalog = useCatalog("attendance_statuses", { keep: true });

  const statuses = useMemo(() => {
    return (attendanceStatusesCatalog.options || []).map((o) => ({
      id: Number(o.value),
      name: o.label,
      code: o.item?.code || "unregistered",
    }));
  }, [attendanceStatusesCatalog.options]);

  const modal = useAttendanceEditModal({
    statuses,
    setAttendances,
    setSummary,
    refetchAttendances,
  });

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

  const side = useMemo(() => {
    if (!realClass) return [];

    const counts = summary?.counts_by_code || {};

    return [
      {
        title: "Detalles",
        variant: "default",
        content: (
          <>
            <InfoRow label="Total Aprendices" value={realClass.apprentices_count ?? 0} variant="line"/>
          </>
        ),
      },
      {
        title: "Resumen",
        variant: "default",
        content: (
          <>
            <InfoRow label="Presente" value={counts.present ?? 0}variant="line" />
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

  if (loading) return <div>Cargando...</div>;
  if (!realClass) return <div>Clase no encontrada</div>;

  return (
    <div className="real-class-show">
      <UserLayout onBack={() => navigate(`/real_classes/${realClassId}`)}>
        <BlocksGrid sections={sections} side={side} />
      </UserLayout>

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