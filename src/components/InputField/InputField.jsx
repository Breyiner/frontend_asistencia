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
  disabled = false,
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
    ? (Array.isArray(value) ? value.map(String) : [])
    : (value ?? "");

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
          size={multiple ? (size ?? 6) : undefined}
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
      ) : (
        <input
          className="input-field__control"
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          autoComplete="off"
          {...rest}
        />
      )}

      {hasError ? <span className="input-field__error">{error}</span> : null}
    </label>
  );
}
