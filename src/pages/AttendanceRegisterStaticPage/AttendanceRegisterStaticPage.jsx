// Hooks de React para estado local
import React, { useState } from "react";
// Hooks de React Router para navegación y parámetros
import { useNavigate, useParams } from "react-router-dom";
// Icono de recarga
import { RiRefreshLine } from "@remixicon/react";

// Componentes de layout y UI
import UserLayout from "../../components/UserLayout/UserLayout";
import BlocksGrid from "../../components/Blocks/BlocksGrid";
import "./AttendanceRegisterStaticPage.css";
import useAttendanceRegister from "../../hooks/useAttendanceRegister";
import AttendanceTable from "../../components/AttendanceTable/AttendanceTable";
import AttendanceMark from "../../components/AttendanceMark/AttendanceMark";
import InputField from "../../components/InputField/InputField";
import Button from "../../components/Button/Button";

// Utilidades de autenticación
import { can } from "../../utils/auth";

/**
 * Componente para registro estático de asistencias por ficha.
 * 
 * Muestra tabla completa de asistencias del mes/año seleccionado
 * para una ficha específica con navegación por fecha y exportación.
 * 
 * Permisos granulares:
 * - attendances.monthlyRegister: acceso completo (vista + navegación)
 * - attendances.export: exportación independiente
 * 
 * Características:
 * - Selector mes/año
 * - Tabla de asistencias con aprendices vs días
 * - Leyenda visual de estados
 * - Exportación de datos
 * - Recarga manual de datos
 * - Información contextual de ficha/programa
 * 
 * Flujo:
 * 1. Carga datos de ficha por ID desde params
 * 2. Usuario selecciona mes/año
 * 3. Renderiza tabla con asistencias
 * 4. Opcional: exporta a archivo
 * 
 * @component
 * @returns {JSX.Element} Registro completo de asistencias de la ficha
 */
export default function AttendanceRegisterStaticPage() {
  // ID de ficha desde URL params
  const { fichaId: paramFichaId } = useParams();
  // Convierte a número, fallback a 1 si inválido
  const fichaId = Number(paramFichaId) || 1;

  // Permisos Spatie granulares
  const canMonthlyRegister = can("attendances.monthlyRegister");
  const canExport = can("attendances.export");

  // Hook para navegación programática
  const navigate = useNavigate();

  /**
   * Hook principal que gestiona todo el registro de asistencias.
   * 
   * Retorna:
   * - payload: datos de ficha/programa
   * - loading/error: estados
   * - year/month/setYear/setMonth: navegación temporal
   * - reload: recarga datos
   * - exportRegister: exportar archivo
   * - legend: códigos de estado → labels
   * - rows/days/slots/columns/dayColSpan: datos para tabla
   */
  const {
    payload,
    loading,
    error,
    year,
    month,
    setYear,
    setMonth,
    reload,
    exportRegister,
    legend,
    rows,
    days,
    slots,
    columns,
    dayColSpan,
  } = useAttendanceRegister(fichaId);

  // Estado local para exportación en curso
  const [exporting, setExporting] = useState(false);

  /**
   * Maneja exportación del registro de asistencias.
   * 
   * Solo ejecuta si tiene permiso attendances.export.
   * 
   * @async
   */
  const handleExport = async () => {
    if (!canExport) {
      alert("No tienes permiso para exportar asistencias");
      return;
    }
    
    setExporting(true);
    const result = await exportRegister(); // Ejecuta exportación
    setExporting(false);
    
    if (!result.success) {
      alert(`Error al exportar: ${result.error}`);
    }
  };

  // Sin permiso monthlyRegister: bloqueo total
  if (!canMonthlyRegister) {
    return (
      <UserLayout onBack={() => navigate(`/fichas/${fichaId}`)}>
        <div className="loading">No tienes acceso a este registro</div>
      </UserLayout>
    );
  }

  // Estados de carga/error iniciales
  if (loading) return <div className="loading">Cargando registro...</div>;
  if (error) return <div className="error">{error}</div>;

  /**
   * Navegación temporal (mes/año) con selector y botón recarga.
   */
  const dateNav = (
    <div className="date-nav">
      {/* Selector mes/año - bloqueado sin monthlyRegister */}
      <InputField
        type="month"
        value={`${String(year)}-${String(month).padStart(2, "0")}`}
        onChange={(e) => {
          const [y, m] = e.target.value.split("-").map(Number);
          setYear(y);
          setMonth(m);
        }}
        disabled={!canMonthlyRegister}
      />
      {/* Botón recarga datos del mes - bloqueado sin monthlyRegister */}
      <Button 
        variant="secondary" 
        onClick={reload} 
        title="Recargar datos"
        disabled={!canMonthlyRegister || loading}
      >
        Recargar
      </Button>
    </div>
  );

  /**
   * Secciones del BlocksGrid para header.
   * 
   * Primera: título e info ficha/programa.
   * Segunda: navegación temporal.
   */
  const sections = [
    {
      left: [
        {
          title: "",
          content: (
            <div className="attendances-register__container-title">
              <span className="attendances-register__title">
                Registro de Asistencias
              </span>
              {/* Nombre programa de formación */}
              <div className="attendances-register__content">
                {payload?.ficha?.training_program?.name || "—"}
              </div>
              {/* Número ficha y jornada */}
              <div className="attendances-register__content">
                Ficha {payload?.ficha?.ficha_number || "-"} -{" "}
                {payload?.ficha?.shift_mode || "—"}
              </div>
            </div>
          ),
        },
      ],
    },
    {
      left: [
        {
          title: "",
          content: <>{dateNav}</>,
        },
      ],
    },
  ];

  /**
   * Sidebar con leyenda visual de estados de asistencia.
   */
  const side = [
    {
      title: "Leyenda de Estados",
      content: (
        <div className="attendance-legend">
          {Object.entries(legend).map(([code, label]) => (
            <div key={code} className="legend-item">
              {/* Icono visual del estado */}
              <AttendanceMark status={code} size="sm" />
              {/* Label del estado */}
              <span>{label}</span>
            </div>
          ))}
        </div>
      ),
    },
  ];

  /**
   * Acciones principales (exportar).
   * 
   * Visible siempre, pero bloqueado sin attendances.export
   */
  const actions = [
    <Button 
      title="Exportar Asistencias" 
      onClick={handleExport}
      disabled={exporting || loading || !canExport} // ← BLOQUEADO: attendances.export
    >
      {exporting ? "Exportando..." : "Exportar"}
    </Button>,
  ];

  return (
    <UserLayout onBack={() => navigate(`/fichas/${fichaId}`)} actions={actions}>
      {/* Header con título y navegación */}
      <BlocksGrid sections={sections} side={side}></BlocksGrid>

      {/* Sección principal: tabla de asistencias */}
      <section className="table-section">
        <h2 className="section-title">Lista de Aprendices</h2>

        {/* Tabla completa de asistencias */}
        <AttendanceTable
          rows={rows}
          days={days}
          slots={slots}
          columns={columns}
          dayColSpan={dayColSpan}
        />
      </section>
    </UserLayout>
  );
}
