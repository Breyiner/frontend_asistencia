import "./AttendanceEditModal.css";

import Button from "../Button/Button";
import InputField from "../InputField/InputField";

import {
  RiCloseLine,
  RiCheckboxCircleLine,
  RiCloseCircleLine,
  RiShieldCheckLine,
  RiLogoutCircleRLine,
  RiTimeLine,
  RiQuestionLine
} from "@remixicon/react";

const UI_BY_CODE = {
  present: { tone: "success", Icon: RiCheckboxCircleLine },
  absent: { tone: "danger", Icon: RiCloseCircleLine },
  excused_absence: { tone: "purple", Icon: RiShieldCheckLine },
  early_exit: { tone: "info", Icon: RiLogoutCircleRLine },
  late: { tone: "warning", Icon: RiTimeLine },
  unregistered: { tone: "neutral", Icon: RiQuestionLine},
};

function subtitleByCode(code) {
  if (code === "excused_absence") return "Requiere descripción.";
  if (code === "early_exit") return "Requiere descripción.";
  if (code === "late") return "Requiere hora de llegada.";
  return "";
}

export default function AttendanceEditModal({
  open,
  onClose,
  saving,

  apprenticeName,

  statuses,
  form,
  errors,
  rules,
  selectedStatus,

  onPickStatusId,
  onChange,
  onSave,
}) {
  if (!open) return null;

  const selectedCode = selectedStatus?.code || "unregistered";

  const showAbsentHoursReadonly =
    selectedCode === "late" && form.absent_hours !== "";

  return (
    <div className="att-modal__backdrop" role="dialog" aria-modal="true">
      <div className="att-modal">
        <div className="att-modal__header">
          <div className="att-modal__title">{apprenticeName || "Editar asistencia"}</div>
          <button type="button" className="att-modal__close" onClick={onClose} disabled={saving}>
            <RiCloseLine size={20} />
          </button>
        </div>

        <div className="att-modal__subtitle">Selecciona el estado de asistencia</div>

        <div className="att-modal__grid">
          {statuses?.map((s) => {
            const ui = UI_BY_CODE[s.code] || { tone: "neutral", Icon: RiCheckboxCircleLine };
            const Icon = ui.Icon;
            const active = String(form.attendance_status_id) === String(s.id);
            const sub = subtitleByCode(s.code);

            return (
              <button
                key={s.id}
                type="button"
                className={`att-option att-option--${ui.tone} ${active ? "att-option--active" : ""}`}
                onClick={() => onPickStatusId(s.id)}
                disabled={saving}
              >
                <div className={`att-option__icon att-option__icon--${ui.tone}`}>
                  <Icon size={20} />
                </div>

                <div className="att-option__txt">
                  <div className="att-option__title">{s.name}</div>
                  {sub ? <div className="att-option__sub">{sub}</div> : null}
                </div>
              </button>
            );
          })}
        </div>

        <div className="att-modal__fields">
          {rules.requiresEntryHour ? (
            <div className="att-modal__row2">
              <InputField
                label="Hora de llegada"
                name="entry_hour"
                type="time"
                value={form.entry_hour}
                onChange={onChange}
                error={errors.entry_hour}
              />

              {showAbsentHoursReadonly ? (
                <InputField
                  label="Cantidad de horas ausente"
                  name="absent_hours"
                  type="text"
                  value={form.absent_hours}
                  onChange={() => {}}
                  disabled
                />
              ) : (
                <div />
              )}
            </div>
          ) : null}

          <InputField
            label="Descripción"
            name="observations"
            type="textarea"
            value={form.observations}
            onChange={onChange}
            error={errors.observations}
            placeholder="Agrega una descripción..."
          />
        </div>

        <div className="att-modal__footer">
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={onSave} disabled={saving}>
            {saving ? "Guardando..." : "Guardar"}
          </Button>
        </div>
      </div>
    </div>
  );
}