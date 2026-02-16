import { useEffect, useMemo, useState } from "react";
import { RiCloseLine, RiCheckLine, RiSearchLine } from "@remixicon/react";
import Button from "../Button/Button";
import "./PermissionsModal.css";

export default function PermissionsModal({
  isOpen,
  onClose,
  onSave,
  title = "Vincular permisos",
  subtitle = "Selecciona los permisos que tendrá este rol",
  permissions = [], // catálogo global [{id,name,display_name,group}]
  initialSelectedIds = [],
  loading = false,
}) {
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState(() => new Set(initialSelectedIds));

  useEffect(() => {
    if (!isOpen) return;
    setSelected(new Set(initialSelectedIds));
    setQ("");
  }, [isOpen, initialSelectedIds]);

  const filtered = useMemo(() => {
    const text = q.trim().toLowerCase();
    if (!text) return permissions;
    return permissions.filter((p) => {
      const a = (p.display_name || "").toLowerCase();
      const b = (p.name || "").toLowerCase();
      const c = (p.group || "").toLowerCase();
      return a.includes(text) || b.includes(text) || c.includes(text);
    });
  }, [permissions, q]);

  const grouped = useMemo(() => {
    const map = new Map();
    for (const p of filtered) {
      const g = p.group || "Otros";
      if (!map.has(g)) map.set(g, []);
      map.get(g).push(p);
    }
    return Array.from(map.entries());
  }, [filtered]);

  const toggle = (id) => {
    if (loading) return;
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectedIds = useMemo(() => Array.from(selected), [selected]);

  const handleClose = () => {
    if (loading) return;
    onClose();
  };

  const handleSave = async () => {
    await onSave(selectedIds);
  };

  if (!isOpen) return null;

  return (
    <div className="perm-modal__backdrop" role="dialog" aria-modal="true">
      <div className="perm-modal">
        <div className="perm-modal__header">
          <div className="perm-modal__title">{title}</div>
          <button
            type="button"
            className="perm-modal__close"
            onClick={handleClose}
            disabled={loading}
          >
            <RiCloseLine size={20} />
          </button>
        </div>

        <div className="perm-modal__subtitle">{subtitle}</div>

        <div className="perm-modal__search">
          <div className="perm-modal__search-icon">
            <RiSearchLine size={18} />
          </div>
          <input
            className="perm-modal__search-input"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar por nombre, código o grupo..."
            disabled={loading}
          />
          <div className="perm-modal__search-count">
            {selectedIds.length} seleccionados
          </div>
        </div>

        <div className="perm-modal__body">
          {grouped.length === 0 ? (
            <div className="perm-modal__empty">No hay permisos para mostrar</div>
          ) : (
            grouped.map(([group, items]) => (
              <div key={group} className="perm-modal__group">
                <div className="perm-modal__group-title">{group}</div>

                <div className="perm-modal__chips">
                  {items.map((p) => {
                    const active = selected.has(p.id);
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => toggle(p.id)}
                        className={`perm-modal__chip ${active ? "perm-modal__chip--active" : ""}`}
                        disabled={loading}
                        title={p.name}
                      >
                        <span className="perm-modal__chip-name">
                          {p.display_name || p.name}
                        </span>
                        <span className="perm-modal__chip-code">{p.name}</span>

                        {active && (
                          <span className="perm-modal__chip-check">
                            <RiCheckLine size={18} />
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="perm-modal__footer">
          <Button variant="secondary" onClick={handleClose} disabled={loading}>
            Cerrar
          </Button>
          <Button variant="primary" onClick={handleSave} disabled={loading}>
            {loading ? "Guardando..." : "Guardar permisos"}
          </Button>
        </div>
      </div>
    </div>
  );
}
