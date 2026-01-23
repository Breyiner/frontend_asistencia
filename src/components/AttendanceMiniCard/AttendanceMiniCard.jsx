import "./AttendanceMiniCard.css";
import "../Badge/Badge.css";

import {
  RiCheckboxCircleLine,
  RiCloseCircleLine,
  RiShieldCheckLine,
  RiTimeLine,
  RiLogoutCircleRLine,
  RiQuestionLine,
  RiArrowRightSLine,
} from "@remixicon/react";

const STATUS_UI = {
  present: { tone: "success", Icon: RiCheckboxCircleLine },
  absent: { tone: "danger", Icon: RiCloseCircleLine },
  excused_absence: { tone: "purple", Icon: RiShieldCheckLine },
  late: { tone: "warning", Icon: RiTimeLine },
  early_exit: { tone: "info", Icon: RiLogoutCircleRLine },
  unregistered: { tone: "neutral", Icon: RiQuestionLine },
};

export default function AttendanceMiniCard({ attendance, onSelect }) {
  const fullName = attendance?.apprentice_full_name || "—";
  const status = attendance?.attendance_status || {};
  const code = status?.code || "unregistered";
  const statusName = status?.name || "Sin Registrar";
  const observations = attendance?.observations || "";

  const ui = STATUS_UI[code] || STATUS_UI.unregistered;
  const Icon = ui.Icon;

  return (
    <button
      type="button"
      className={`attendance-mini attendance-mini--${ui.tone}`}
      onClick={() => onSelect?.(attendance)}
    >
      <div className="attendance-mini__left">
        <div className={`attendance-mini__icon attendance-mini__icon--${ui.tone}`}>
          <Icon size={22} />
        </div>

        <div className="attendance-mini__text">
          <div className="attendance-mini__name">{fullName}</div>
          {observations ? <div className="attendance-mini__obs">{observations}</div> : null}
        </div>
      </div>

      <div className="attendance-mini__right">
        <span className={`badge badge--fill-${ui.tone}`}>{statusName}</span>
        <span className="attendance-mini__chevron" aria-hidden="true">
          <RiArrowRightSLine size={20} />
        </span>
      </div>
    </button>
  );
}