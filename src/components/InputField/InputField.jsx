import "./InputField.css";

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

  ...rest
}) {
  const hasError = Boolean(error);

  const handleSelectChange = (e) => {
    if (multiple) {
      const values = Array.from(e.target.selectedOptions).map((opt) => opt.value);
      if (onChange) onChange({ target: { name, value: values } });
    } else {
      if (onChange) onChange(e);
    }
  };

  const selectValue = multiple
    ? Array.isArray(value)
      ? value.map(String)
      : []
    : value ?? "";

  const inputValue = type === "date" ? normalizeDateValue(value) : value ?? "";

  const isControlKey = (e) =>
    e.ctrlKey ||
    e.metaKey ||
    e.altKey ||
    [
      "Backspace",
      "Delete",
      "Tab",
      "Enter",
      "Escape",
      "ArrowLeft",
      "ArrowRight",
      "ArrowUp",
      "ArrowDown",
      "Home",
      "End",
    ].includes(e.key);

  const sanitize = (raw) => {
    const v = String(raw ?? "");
    if (!allow) return v;

    if (allow === "digits") return v.replace(/\D+/g, "");
    if (allow === "letters") return v.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+/g, "");
    if (allow === "alphanumeric") return v.replace(/[^a-zA-Z0-9]+/g, "");
    return v;
  };

  const handleKeyDown = (e) => {
    if (!allow) return;
    if (isControlKey(e)) return;

    const key = e.key;

    if (allow === "digits" && !/^\d$/.test(key)) e.preventDefault();
    if (allow === "letters" && !/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]$/.test(key)) e.preventDefault();
    if (allow === "alphanumeric" && !/^[a-zA-Z0-9]$/.test(key)) e.preventDefault();
  };

  const handlePaste = (e) => {
    if (!allow) return;

    const text = e.clipboardData?.getData("text") ?? "";
    const cleaned = sanitize(text);

    if (cleaned !== text) e.preventDefault();
  };

  const handleInputChange = (e) => {
    if (!onChange) return;

    if (!allow) {
      onChange(e);
      return;
    }

    const cleaned = sanitize(e.target.value);
    onChange({ target: { name, value: cleaned } });
  };

  return (
    <label className={`input-field ${hasError ? "input-field--error" : ""}`}>
      <span className="input-field__label">{label}</span>

      {options ? (
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
          {!multiple && <option value="">{placeholder || "Seleccione..."}</option>}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ) : textarea ? (
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

      {hasError ? <span className="input-field__error">{error}</span> : null}
    </label>
  );
}