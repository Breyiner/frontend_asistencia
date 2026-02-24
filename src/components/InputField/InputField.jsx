import { useInputField } from "../../hooks/useInputField";
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
  if (typeof v === "string" && v.includes("T")) return v.split("T")[0];

  if (v instanceof Date && !Number.isNaN(v.getTime())) {
    const yyyy = v.getFullYear();
    const mm = String(v.getMonth() + 1).padStart(2, "0");
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
 * @param {string}   label         Etiqueta visible del campo.
 * @param {string}   name          Nombre del campo (usado en eventos sintéticos).
 * @param {*}        value         Valor controlado del campo.
 * @param {Function} onChange      Callback al cambiar el valor.
 * @param {string}   [type]        Tipo de input HTML. Default: "text".
 * @param {string}   [placeholder]
 * @param {boolean}  [required]
 * @param {string}   [error]       Mensaje de error. Si existe, aplica estilos de error.
 * @param {Array}    [options]     Opciones { value, label } para select o combo.
 * @param {boolean}  [multiple]    Permite selección múltiple en select y combo.
 * @param {number}   [size]        Altura visual del select múltiple nativo.
 * @param {boolean}  [disabled]
 * @param {string}   [allow]       Restringe caracteres: "digits" | "letters" | "alphanumeric".
 * @param {boolean}  [textarea]    Renderiza un textarea en lugar de input.
 * @param {number}   [rows]        Filas del textarea. Default: 3.
 * @param {boolean}  [combo]       Activa el combobox con búsqueda (react-select).
 * @param {number}   [max]         Máximo de caracteres permitidos en input y textarea.
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
  max = null,
  ...rest
}) {
  const hasError = Boolean(error);
  const isMulti = multiple || rest.isMulti;

  const {
    selectValue,
    comboSelected,
    handleSelectChange,
    handleKeyDown,
    handlePaste,
    handleInputChange,
    handleComboChange,
  } = useInputField({ name, value, onChange, type, multiple, allow, max, options, isMulti });

  // Las fechas requieren formato estricto YYYY-MM-DD; el resto usa el valor directo.
  const inputValue = type === "date" ? normalizeDateValue(value) : value ?? "";

  return (
    // El label como contenedor permite hacer click en la etiqueta para enfocar el control.
    <label className={`input-field ${hasError ? "input-field--error" : ""}`}>

      <span className="input-field__label">{label}</span>

      {combo ? (
        // Combobox con búsqueda en cliente sobre las options ya cargadas.
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
        // Select nativo: simple o múltiple según la prop `multiple`.
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
          {/* Opción vacía inicial solo para selects simples */}
          {!multiple && <option value="">{placeholder || "Seleccione..."}</option>}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ) : textarea ? (
        // Textarea para texto multilínea.
        <textarea
          className="input-field__control input-field__control--textarea"
          name={name}
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          rows={rows}
          {...rest}
        />
      ) : (
        // Input estándar. inputMode="numeric" activa teclado numérico en móviles
        // cuando allow="digits".
        <input
          className="input-field__control"
          name={name}
          type={type}
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          autoComplete="off"
          inputMode={allow === "digits" ? "numeric" : undefined}
          {...rest}
        />
      )}

      {/* El mensaje de error solo se monta si existe, para no dejar espacio vacío */}
      {hasError ? <span className="input-field__error">{error}</span> : null}
    </label>
  );
}
