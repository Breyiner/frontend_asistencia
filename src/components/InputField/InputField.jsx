import "./InputField.css";
import Select from "react-select";

/**
 * Normaliza un valor de fecha al formato YYYY-MM-DD que esperan los inputs tipo "date".
 *
 * Casos que maneja:
 *   null / undefined / string vacío  ->  string vacío
 *   "2024-01-15"                     ->  retorna tal cual
 *   "2024-01-15T10:30:00Z"           ->  "2024-01-15" (recorta el timestamp)
 *   objeto Date válido               ->  "2024-01-15"
 *   cualquier otro valor             ->  String(v)
 */
function normalizeDateValue(v) {
  if (v == null || v === "") return "";

  if (typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v)) return v;

  // Timestamp ISO: toma solo la parte antes de la "T"
  if (typeof v === "string" && v.includes("T")) return v.split("T")[0];

  if (v instanceof Date && !Number.isNaN(v.getTime())) {
    const yyyy = v.getFullYear();
    const mm = String(v.getMonth() + 1).padStart(2, "0"); // getMonth es 0-indexado
    const dd = String(v.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }

  return String(v);
}

/**
 * Campo de entrada multifuncional. Renderiza uno de estos controles
 * según las props recibidas:
 *
 *   combo=true          ->  Combobox con búsqueda (react-select)
 *   options (sin combo) ->  Select nativo
 *   textarea=true       ->  Textarea
 *   default             ->  Input HTML estándar
 *
 * Todos los modos comparten la misma estructura visual:
 * label > control > mensaje de error.
 *
 * Soporta single y multiple selection en todos los modos.
 *
 * @param {string}   label        Etiqueta visible del campo.
 * @param {string}   name         Nombre del campo (usado en eventos sintéticos).
 * @param {*}        value        Valor controlado del campo.
 * @param {Function} onChange     Callback al cambiar el valor.
 * @param {string}   [type]       Tipo de input HTML. Default: "text".
 * @param {string}   [placeholder]
 * @param {boolean}  [required]
 * @param {string}   [error]      Mensaje de error. Si existe, aplica estilos de error.
 * @param {Array}    [options]    Opciones { value, label } para select o combo.
 * @param {boolean}  [multiple]   Permite selección múltiple en select y combo.
 * @param {number}   [size]       Altura visual del select múltiple nativo.
 * @param {boolean}  [disabled]
 * @param {string}   [allow]      Restringe caracteres: "digits" | "letters" | "alphanumeric".
 * @param {boolean}  [textarea]   Renderiza un textarea en lugar de input.
 * @param {number}   [rows]       Filas del textarea. Default: 3.
 * @param {boolean}  [combo]      Activa el combobox con búsqueda (react-select).
 */
export default function InputField({
  label,
  name,
  value,
  onChange,
  type = "text",
  placeholder = "",
  required = false,
  error = "",
  options = null,
  multiple = false,
  size,
  disabled = false,
  allow = null,
  textarea = false,
  rows = 3,
  combo = false,
  ...rest
}) {
  const hasError = Boolean(error);
  const isMulti = multiple || rest.isMulti;

  // ─── Select nativo ────────────────────────────────────────────────────────

  /**
   * Para selects múltiples extrae todos los valores seleccionados y emite
   * un evento sintético con un array. Para selects simples pasa el evento original.
   */
  const handleSelectChange = (e) => {
    if (multiple) {
      const values = Array.from(e.target.selectedOptions).map((opt) => opt.value);
      if (onChange) onChange({ target: { name, value: values } });
    } else {
      if (onChange) onChange(e);
    }
  };

  // El select múltiple necesita un array; el simple usa string vacío como fallback.
  const selectValue = multiple
    ? Array.isArray(value) ? value.map(String) : []
    : value ?? "";

  // ─── Inputs de texto / fecha ──────────────────────────────────────────────

  // Las fechas requieren formato estricto YYYY-MM-DD; el resto usa el valor directo.
  const inputValue = type === "date" ? normalizeDateValue(value) : value ?? "";

  /**
   * Devuelve true si la tecla presionada es de control (navegación, edición, etc.)
   * y por tanto no debe ser bloqueada por la restricción `allow`.
   */
  const isControlKey = (e) =>
    e.ctrlKey || e.metaKey || e.altKey ||
    ["Backspace", "Delete", "Tab", "Enter", "Escape",
      "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End",
    ].includes(e.key);

  /**
   * Elimina del string los caracteres que no permite `allow`.
   * Si `allow` es null, retorna el valor sin modificar.
   */
  const sanitize = (raw) => {
    const v = String(raw ?? "");
    if (!allow) return v;
    if (allow === "digits")       return v.replace(/\D+/g, "");
    if (allow === "letters")      return v.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+/g, "");
    if (allow === "alphanumeric") return v.replace(/[^a-zA-Z0-9]+/g, "");
    return v;
  };

  // Bloquea la tecla en tiempo real si el caracter no esta permitido.
  const handleKeyDown = (e) => {
    if (!allow || isControlKey(e)) return;
    const key = e.key;
    if (allow === "digits"        && !/^\d$/.test(key))                       e.preventDefault();
    if (allow === "letters"       && !/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]$/.test(key)) e.preventDefault();
    if (allow === "alphanumeric"  && !/^[a-zA-Z0-9]$/.test(key))             e.preventDefault();
  };

  // Cancela el pegado si el texto contiene caracteres no permitidos.
  const handlePaste = (e) => {
    if (!allow) return;
    const text = e.clipboardData?.getData("text") ?? "";
    if (sanitize(text) !== text) e.preventDefault();
  };

  // Aplica sanitizacion al cambiar el valor. Si no hay restriccion, pasa el evento tal cual.
  const handleInputChange = (e) => {
    if (!onChange) return;
    if (!allow) { onChange(e); return; }
    onChange({ target: { name, value: sanitize(e.target.value) } });
  };

  // ─── Combobox (react-select) ──────────────────────────────────────────────

  /**
   * Maneja single y multiple selection.
   * Emite evento sintético consistente con otros controles:
   * single: string | null
   * multiple: array de strings
   */
  const handleComboChange = (selectedOptions) => {
    const values = Array.isArray(selectedOptions) 
      ? selectedOptions.map(opt => opt.value)
      : selectedOptions?.value ? [selectedOptions.value] : [];
    
    if (onChange) {
      onChange({ 
        target: { 
          name, 
          value: isMulti ? values : values[0] || "" 
        } 
      });
    }
  };

  // Soporte single/multi para react-select
  const comboSelected = Array.isArray(value) 
    ? options?.filter(o => value.some(v => String(v) === String(o.value))) || []
    : options?.find(o => String(o.value) === String(value)) ?? null;

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    // El label como contenedor permite hacer click en la etiqueta para enfocar el control.
    <label className={`input-field ${hasError ? "input-field--error" : ""}`}>

      <span className="input-field__label">{label}</span>

      {combo ? (
        // Combobox con busqueda en cliente sobre las options ya cargadas.
        // Soporta single/multi con la misma prop `multiple`.
        <Select
          options={options ?? []}
          value={comboSelected}
          onChange={handleComboChange}
          isDisabled={disabled}
          isMulti={isMulti}
          placeholder={placeholder || "Buscar..."}
          classNamePrefix="combo"
          isSearchable
          closeMenuOnSelect={!isMulti}
          filterOption={(opt, input) =>
            opt.label.toLowerCase().includes(input.toLowerCase())
          }
          noOptionsMessage={() => "Sin resultados"}
          required={required}
          {...rest}
        />
      ) : options ? (
        // Select nativo: simple o multiple segun la prop `multiple`.
        <select
          className="input-field__control"
          name={name}
          value={selectValue}
          onChange={handleSelectChange}
          required={required}
          multiple={multiple}
          size={multiple ? size ?? 6 : undefined}
          disabled={disabled}
          {...rest}
        >
          {/* Opcion vacia inicial solo para selects simples */}
          {!multiple && <option value="">{placeholder || "Seleccione..."}</option>}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ) : textarea ? (
        // Textarea para texto multilinea.
        <textarea
          className="input-field__control input-field__control--textarea"
          name={name}
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={allow ? handleKeyDown : undefined}
          onPaste={allow ? handlePaste : undefined}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          rows={rows}
          {...rest}
        />
      ) : (
        // Input estandar. inputMode="numeric" activa teclado numerico en moviles
        // cuando allow="digits".
        <input
          className="input-field__control"
          name={name}
          type={type}
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={allow ? handleKeyDown : undefined}
          onPaste={allow ? handlePaste : undefined}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          autoComplete="off"
          inputMode={allow === "digits" ? "numeric" : undefined}
          {...rest}
        />
      )}

      {/* El mensaje de error solo se monta si existe, para no dejar espacio vacio */}
      {hasError ? <span className="input-field__error">{error}</span> : null}
    </label>
  );
}