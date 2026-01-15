import "./InputField.css";

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
  ...rest
}) {
  const hasError = Boolean(error);

  const handleSelectChange = (e) => {
    if (!multiple) return onChange(e);

    const values = Array.from(e.target.selectedOptions).map((opt) => opt.value);
    // envía como si fuera un input normal
    onChange({ target: { name, value: values } });
  };

  const selectValue = multiple
    ? (Array.isArray(value) ? value.map(String) : [])
    : (value ?? "");

  return (
    <label className={hasError ? "input-field input-field--error" : "input-field"}>
      <span className="input-field__label">{label}</span>

      {options ? (
        <select
          className="input-field__input"
          name={name}
          value={selectValue}
          onChange={handleSelectChange}
          required={required}
          multiple={multiple}
          size={multiple ? (size ?? 6) : undefined}
          {...rest}
        >
          {!multiple && <option value="">{placeholder || "Seleccione..."}</option>}

          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          className="input-field__input"
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          {...rest}
        />
      )}

      {hasError ? <span className="input-field__error">{error}</span> : null}
    </label>
  );
}