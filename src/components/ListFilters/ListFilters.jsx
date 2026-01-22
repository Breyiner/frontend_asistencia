import { useMemo, useState, useEffect } from "react";
import TextField from "../InputField/InputField";
import Button from "../Button/Button";
import {
  RiFilterLine,
  RiCloseLine,
  RiSearchLine,
  RiArrowDownSLine,
  RiArrowUpSLine,
} from "@remixicon/react";
import "./ListFilters.css";

export default function ListFilters({ config = [], onChange }) {
  const initialFilters = useMemo(() => {
    return config.reduce(
      (acc, f) => ({ ...acc, [f.name]: f.defaultValue ?? "" }),
      {}
    );
  }, [config]);

  const [filters, setFilters] = useState(initialFilters);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    setFilters(initialFilters);
  }, [initialFilters]);

  const primaryFilters = useMemo(() => config.filter((f) => !f.advanced), [config]);
  const advancedFilters = useMemo(() => config.filter((f) => f.advanced), [config]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onChange?.(filters);
  };

  const handleClear = () => {
    const cleared = config.reduce(
      (acc, f) => ({ ...acc, [f.name]: f.defaultValue ?? "" }),
      {}
    );
    setFilters(cleared);
    onChange?.(cleared);
  };

  const renderField = (field) => {
    const isSelect = field.type === "select";

    return (
      <TextField
        key={field.name}
        name={field.name}
        label={field.label}
        value={filters[field.name] ?? ""}
        onChange={handleInputChange}
        placeholder={field.placeholder}
        disabled={field.disabled}
        select={isSelect}
        options={isSelect ? field.options || [] : undefined}
        type={!isSelect ? field.type || "text" : undefined}
        leftIcon={field.withSearchIcon ? <RiSearchLine size={18} /> : null}
      />
    );
  };

  return (
    <form className="data-filters" onSubmit={handleSubmit} autoComplete="off">
      <div className="data-filters__row">
        <div className="data-filters__primary">
          {primaryFilters.map(renderField)}
        </div>

        <div className="data-filters__actions">
          {advancedFilters.length > 0 && (
            <Button
              type="button"
              variant="secondary"
              onClick={() => setExpanded((v) => !v)}
            >
              {expanded ? (
                <>
                  Menos filtros <RiArrowUpSLine size={16} />
                </>
              ) : (
                <>
                  Más filtros <RiArrowDownSLine size={16} />
                </>
              )}
            </Button>
          )}

          <Button type="submit" variant="primary">
            <RiFilterLine size={18} />
            Filtrar
          </Button>

          <Button type="button" variant="secondary" onClick={handleClear}>
            <RiCloseLine size={16} />
            Limpiar
          </Button>
        </div>
      </div>

      {expanded && advancedFilters.length > 0 && (
        <div className="data-filters__advanced">
          <div className="data-filters__row data-filters__row--compact">
            {advancedFilters.map(renderField)}
          </div>
        </div>
      )}
    </form>
  );
}