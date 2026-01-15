const EMAIL_REGEXP = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const PASSWORD_FULL = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;

export function validarCamposReact(values, schema) {
  const errors = {};
  const data = {};

  for (const field of schema) {
    const {
      name,
      type = "text",
      required = false,
      min,
      max,
      minLength,
      maxLength,
      pattern,
      patternMessage = "Formato inválido",
    } = field;

    let value = values?.[name];
    if (typeof value === "string") value = value.trim();

    const empty =
      value === undefined ||
      value === null ||
      value === "" ||
      (type === "select" && (value === 0 || value === "0"));

    if (required && empty) {
      errors[name] = "El campo es obligatorio.";
      continue;
    }

    if (empty) continue;

    if (type === "email") {
      if (!EMAIL_REGEXP.test(String(value))) {
        errors[name] = "Formato de correo inválido";
        continue;
      }
    }

    if (type === "password") {
      const v = String(value);

      if (!/[A-Z]/.test(v)) { errors[name] = "Debe tener una mayúscula"; continue; }
      if (!/[a-z]/.test(v)) { errors[name] = "Debe tener una minúscula"; continue; }
      if (!/\d/.test(v))    { errors[name] = "Debe tener un número"; continue; }
      if (!/\W/.test(v))    { errors[name] = "Debe tener un caracter especial"; continue; }
      if (v.length < 8)     { errors[name] = "Mínimo 8 caracteres"; continue; }

      if (!PASSWORD_FULL.test(v)) {
        errors[name] = "Formato inválido";
        continue;
      }
    }

    if (typeof value === "string") {
      if (minLength != null && value.length < minLength) {
        errors[name] = `Mínimo ${minLength} caracteres`;
        continue;
      }
      if (maxLength != null && value.length > maxLength) {
        errors[name] = `Máximo ${maxLength} caracteres`;
        continue;
      }
    }

    const isNumericString =
      typeof value === "string" && value !== "" && /^-?\d+(\.\d+)?$/.test(value);

    const asNumber = isNumericString ? Number(value) : null;

    if (asNumber !== null && !Number.isNaN(asNumber)) {
      if (min != null && asNumber < min) { errors[name] = `Mínimo ${min}`; continue; }
      if (max != null && asNumber > max) { errors[name] = `Máximo ${max}`; continue; }
    }

    if (pattern) {
      const re = pattern instanceof RegExp ? pattern : new RegExp(String(pattern));
      if (!re.test(String(value))) {
        errors[name] = patternMessage;
        continue;
      }
    }

    data[name] = isNumericString ? Number(value) : value;
  }

  return { ok: Object.keys(errors).length === 0, errors, data };
}