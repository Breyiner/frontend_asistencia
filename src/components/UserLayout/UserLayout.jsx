import { RiArrowLeftLine } from "@remixicon/react";
import "./UserLayout.css";

export default function UserLayout({ onBack, actions, children }) {
  return (
    <div className="user-layout">
      <div className="user-layout__top">
        <button type="button" className="user-layout__back" onClick={onBack}>
            <RiArrowLeftLine size={18} />
            Volver a la lista
        </button>

        <div className="user-layout__actions">
          {actions}
        </div>
      </div>

      {children}
    </div>
  );
}
