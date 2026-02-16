/**
 * Expresión regular para validar emails.
 * Acepta formato estándar: usuario@dominio.tld
 * 
 * @constant
 */
const EMAIL_REGEXP = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

/**
 * Expresión regular para validar contraseña fuerte.
 * 
 * Requiere:
 * - Al menos una minúscula (?=.*[a-z])
 * - Al menos una mayúscula (?=.*[A-Z])
 * - Al menos un dígito (?=.*\d)
 * - Al menos un caracter especial (?=.*[\W_])
 * - Mínimo 8 caracteres (.{8,})
 * 
 * @constant
 */
const PASSWORD_FULL = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;

/**
 * Valida un formulario completo según un esquema de reglas.
 * 
 * Función principal de validación del lado del cliente.
 * Verifica cada campo según reglas configurables y retorna
 * objeto con errores y datos limpios.
 * 
 * Tipos de validación soportados:
 * - text: texto general
 * - email: formato de email
 * - password: contraseña fuerte
 * - select: selects (verifica que no sea 0 o "0")
 * - date, number, etc: validaciones básicas
 * 
 * Reglas disponibles:
 * - required: campo obligatorio
 * - min/max: valores numéricos mínimos/máximos
 * - minLength/maxLength: longitud de strings
 * - pattern: expresión regular personalizada
 * 
 * @function
 * @param {Object} values - Valores del formulario (name: value)
 * @param {Array<Object>} schema - Esquema de validación
 * @param {string} schema[].name - Nombre del campo
 * @param {string} [schema[].type="text"] - Tipo de campo
 * @param {boolean} [schema[].required=false] - Si es obligatorio
 * @param {number} [schema[].min] - Valor numérico mínimo
 * @param {number} [schema[].max] - Valor numérico máximo
 * @param {number} [schema[].minLength] - Longitud mínima de string
 * @param {number} [schema[].maxLength] - Longitud máxima de string
 * @param {RegExp|string} [schema[].pattern] - Patrón personalizado
 * @param {string} [schema[].patternMessage="Formato inválido"] - Mensaje si falla pattern
 * @returns {Object} Objeto con {ok, errors, data}
 * 
 * @example
 * const schema = [
 *   { name: "email", type: "email", required: true },
 *   { name: "age", type: "text", min: 18, max: 100 },
 *   { name: "name", type: "text", required: true, maxLength: 50 }
 * ];
 * 
 * const result = validarCamposReact(formValues, schema);
 * 
 * if (result.ok) {
 *   // Enviar al backend
 *   await api.post("users", result.data);
 * } else {
 *   // Mostrar errores
 *   setErrors(result.errors);
 * }
 */
export function validarCamposReact(values, schema) {
  // Objetos para acumular errores y datos limpios
  const errors = {};
  const data = {};

  // Itera sobre cada campo del esquema
  for (const field of schema) {
    // Desestructura configuración del campo
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

    // Obtiene el valor del formulario
    let value = values?.[name];
    
    // Si es string, hace trim (remueve espacios)
    if (typeof value === "string") value = value.trim();

    // Determina si el campo está vacío
    const empty =
      value === undefined ||
      value === null ||
      value === "" ||
      // Para selects, 0 o "0" se consideran vacíos
      (type === "select" && (value === 0 || value === "0"));

    /**
     * VALIDACIÓN: Campo obligatorio
     */
    if (required && empty) {
      errors[name] = "El campo es obligatorio.";
      continue; // Salta al siguiente campo
    }

    // Si está vacío pero no es obligatorio, continúa sin validar más
    if (empty) continue;

    /**
     * VALIDACIÓN: Email
     */
    if (type === "email") {
      if (!EMAIL_REGEXP.test(String(value))) {
        errors[name] = "Formato de correo inválido";
        continue;
      }
    }

    /**
     * VALIDACIÓN: Contraseña fuerte
     * 
     * Valida cada requisito por separado para dar
     * mensajes de error específicos.
     */
    if (type === "password") {
      const v = String(value);

      // Verifica mayúscula
      if (!/[A-Z]/.test(v)) { 
        errors[name] = "Debe tener una mayúscula"; 
        continue; 
      }
      
      // Verifica minúscula
      if (!/[a-z]/.test(v)) { 
        errors[name] = "Debe tener una minúscula"; 
        continue; 
      }
      
      // Verifica número
      if (!/\d/.test(v)) { 
        errors[name] = "Debe tener un número"; 
        continue; 
      }
      
      // Verifica caracter especial
      if (!/\W/.test(v)) { 
        errors[name] = "Debe tener un caracter especial"; 
        continue; 
      }
      
      // Verifica longitud mínima
      if (v.length < 8) { 
        errors[name] = "Mínimo 8 caracteres"; 
        continue; 
      }

      // Validación completa con regex
      if (!PASSWORD_FULL.test(v)) {
        errors[name] = "Formato inválido";
        continue;
      }
    }

    /**
     * VALIDACIÓN: Longitud de strings
     */
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

    /**
     * VALIDACIÓN: Rangos numéricos
     * 
     * Detecta si el valor es un string numérico y lo valida.
     */
    const isNumericString =
      typeof value === "string" && value !== "" && /^-?\d+(\.\d+)?$/.test(value);

    const asNumber = isNumericString ? Number(value) : null;

    if (asNumber !== null && !Number.isNaN(asNumber)) {
      if (min != null && asNumber < min) { 
        errors[name] = `Mínimo ${min}`; 
        continue; 
      }
      if (max != null && asNumber > max) { 
        errors[name] = `Máximo ${max}`; 
        continue; 
      }
    }

    /**
     * VALIDACIÓN: Patrón personalizado
     */
    if (pattern) {
      // Convierte a RegExp si es string
      const re = pattern instanceof RegExp ? pattern : new RegExp(String(pattern));
      
      if (!re.test(String(value))) {
        errors[name] = patternMessage;
        continue;
      }
    }

    /**
     * Si pasó todas las validaciones, agrega a data.
     * Convierte strings numéricos a números.
     */
    data[name] = isNumericString ? Number(value) : value;
  }

  // Retorna resultado
  return { 
    ok: Object.keys(errors).length === 0, // true si no hay errores
    errors,                                 // Objeto de errores por campo
    data                                    // Datos limpios validados
  };
}