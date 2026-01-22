import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";

import UserLayout from "../../components/UserLayout/UserLayout";
import BlocksGrid from "../../components/Blocks/BlocksGrid";
import InfoRow from "../../components/InfoRow/InfoRow";
import ScheduleSessionsList from "../../components/ScheduleSessionList/ScheduleSessionList";

import useFichaShow from "../../hooks/useFichaShow";
import useFichaTermSchedule from "../../hooks/useFichaTermSchedule";
import "./ScheduleFichaTermPage.css";

export default function ScheduleFichaTermPage() {
  const { fichaId, fichaTermId } = useParams();
  const navigate = useNavigate();

  const { ficha, loading: fichaLoading } = useFichaShow(fichaId);
  const { schedule, loading: scheduleLoading, deleteSession } = useFichaTermSchedule({ fichaTermId });

  const loading = fichaLoading || scheduleLoading;

  const sections = useMemo(
    () => [
      {
        left: [
          {
            title: "",
            content: (
              <div className="schedule-head">
                <div className="schedule-head__text">
                  <h2 className="schedule-head__title">
                    Horario Ficha {schedule?.ficha?.number ?? ficha?.ficha_number ?? ""}
                  </h2>

                  <div className="schedule-head__subtitle">
                    <span>{schedule?.ficha?.training_program_name ?? ficha?.training_program_name ?? ""}</span>
                    <span className="schedule-head__dot">•</span>
                    <span>{schedule?.term?.name ?? ""}</span>
                    <span className="schedule-head__dot">•</span>
                    <span>{schedule?.phase?.name ?? ""}</span>
                  </div>
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
            content: (
              <ScheduleSessionsList
                sessions={schedule?.sessions || []}
                associateTo={`/fichas/${fichaId}/ficha_terms/${fichaTermId}/schedule/${schedule?.id}/session/create`}
                onEdit={(s) =>
                  navigate(`/fichas/${fichaId}/ficha_terms/${fichaTermId}/schedule/${schedule?.id}/session/${s.id}/update`)
                }
                onDelete={(s) => deleteSession(s.id)}
              />
            ),
          },
        ],
      },
    ],
    [schedule, ficha, fichaId, fichaTermId, navigate]
  );

  const side = useMemo(() => {
    const resumen = schedule
      ? {
          title: "Resumen:",
          variant: "default",
          content: (
            <>
              <InfoRow label="Ficha" value={schedule?.ficha?.number ?? ficha?.ficha_number} />
              <InfoRow label="Trimestre" value={schedule?.term?.name ?? "—"} />
              <InfoRow label="Fase" value={schedule?.phase?.name ?? "—"} />
              <InfoRow
                label="Periodo"
                value={
                  schedule?.term_dates?.start_date && schedule?.term_dates?.end_date
                    ? `${schedule.term_dates.start_date} - ${schedule.term_dates.end_date}`
                    : "—"
                }
              />
            </>
          ),
        }
      : null;

    const infoAdicional = schedule
      ? {
          title: "Información Adicional",
          variant: "default",
          content: (
            <>
              <InfoRow label="ID" value={schedule.id} />
              <InfoRow label="Fecha registro" value={schedule.created_at} />
              <InfoRow label="Última actualización" value={schedule.updated_at} />
            </>
          ),
        }
      : null;

    const nota = {
      title: "Nota",
      variant: "info",
      content: <p>Los cambios realizados se guardarán automáticamente en el sistema</p>,
    };

    return [resumen, infoAdicional, nota].filter(Boolean);
  }, [schedule, ficha]);

  const actions = useMemo(() => <></>, []);

  if (loading) return <div>Cargando...</div>;
  if (!ficha) return <div>Ficha no encontrada</div>;
  if (!schedule) return <div>Horario no encontrado</div>;

  return (
    <div className="schedule-ficha-term">
      <UserLayout onBack={() => navigate(`/fichas/${fichaId}`)} actions={actions}>
        <BlocksGrid sections={sections} side={side} />
      </UserLayout>
    </div>
  );
}
