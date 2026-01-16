import { useState } from "react";
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

export default function ListFilters({ config, onChange }) {
  const [filters, setFilters] = useState(
    config.reduce((acc, f) => ({ ...acc, [f.name]: f.defaultValue || "" }), {})
  );
  const [expanded, setExpanded] = useState(false);

  const primaryFilters = config.filter((f) => !f.advanced);
  const advancedFilters = config.filter((f) => f.advanced);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onChange(filters);
  };

  const handleClear = () => {
    const cleared = config.reduce(
      (acc, f) => ({ ...acc, [f.name]: f.defaultValue || "" }),
      {}
    );
    setFilters(cleared);
    onChange(cleared);
  };

  return (
    <form className="data-filters" onSubmit={handleSubmit} autoComplete="off">
      <div className="data-filters__row">
        <div className="data-filters__primary">
          {primaryFilters.map((field) => (
            <TextField
              key={field.name}
              name={field.name}
              label={field.label}
              value={filters[field.name]}
              onChange={handleInputChange}
              placeholder={field.placeholder}
              type={field.type || "text"}
              leftIcon={
                field.withSearchIcon ? <RiSearchLine size={18} /> : null
              }
            />
          ))}
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
            {advancedFilters.map((field) => (
              <TextField
                key={field.name}
                name={field.name}
                label={field.label}
                value={filters[field.name]}
                onChange={handleInputChange}
                placeholder={field.placeholder}
                type={field.type || "text"}
              />
            ))}
          </div>
        </div>
      )}
    </form>
  );
}
