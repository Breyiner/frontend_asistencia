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
    ...rest
}) {
    const hasError = Boolean(error);

    return (
        <label className={hasError ? "input-field input-field--error" : "input-field"}>
            <span className="input-field__label">{label}</span>

            {options ? (
                <select
                    className="input-field__input"
                    name={name}
                    value={value}
                    onChange={onChange}
                    required={required}
                    {...rest}
                >
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