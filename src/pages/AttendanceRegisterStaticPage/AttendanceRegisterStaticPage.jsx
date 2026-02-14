import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { RiRefreshLine } from "@remixicon/react";

import UserLayout from "../../components/UserLayout/UserLayout";
import BlocksGrid from "../../components/Blocks/BlocksGrid";
import "./AttendanceRegisterStaticPage.css";
import useAttendanceRegister from "../../hooks/useAttendanceRegister";
import AttendanceTable from "../../components/AttendanceTable/AttendanceTable";
import AttendanceMark from "../../components/AttendanceMark/AttendanceMark";
import InputField from "../../components/InputField/InputField";
import Button from "../../components/Button/Button";

export default function AttendanceRegisterStaticPage() {
  const { fichaId: paramFichaId } = useParams();
  const fichaId = Number(paramFichaId) || 1;

  const navigate = useNavigate();

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

  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    const result = await exportRegister();
    setExporting(false);
    
    if (!result.success) {
      alert(`Error al exportar: ${result.error}`);
    }
  };

  if (loading) return <div className="loading">Cargando registro...</div>;
  if (error) return <div className="error">{error}</div>;

  const dateNav = (
    <div className="date-nav">
      <InputField
        type="month"
        value={`${String(year)}-${String(month).padStart(2, "0")}`}
        onChange={(e) => {
          const [y, m] = e.target.value.split("-").map(Number);
          setYear(y);
          setMonth(m);
        }}
      />
      <Button variant="secondary" onClick={reload} title="Recargar datos">
        Recargar
      </Button>
    </div>
  );

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
              <div className="attendances-register__content">
                {payload?.ficha?.training_program?.name || "—"}
              </div>
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

  const side = [
    {
      title: "Leyenda de Estados",
      content: (
        <div className="attendance-legend">
          {Object.entries(legend).map(([code, label]) => (
            <div key={code} className="legend-item">
              <AttendanceMark status={code} size="sm" />
              <span>{label}</span>
            </div>
          ))}
        </div>
      ),
    },
  ];

  const actions = [
    <Button 
      title="Exportar Asistencias" 
      onClick={handleExport}
      disabled={exporting || loading}
    >
      {exporting ? "Exportando..." : "Exportar"}
    </Button>,
  ];

  return (
    <UserLayout onBack={() => navigate(`/fichas/${fichaId}`)} actions={actions}>
      <BlocksGrid sections={sections} side={side}></BlocksGrid>

      <section className="table-section">
        <h2 className="section-title">Lista de Aprendices</h2>

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