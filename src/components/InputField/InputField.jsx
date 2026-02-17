// Importa estilos del campo de entrada
import "./InputField.css";

/**
 * Normaliza valores de fecha a formato ISO (YYYY-MM-DD).
 * 
 * Maneja diferentes formatos de entrada:
 * - null/undefined/string vacío → string vacío
 * - String en formato ISO (YYYY-MM-DD) → retorna tal cual
 * - String con timestamp ISO (con T) → extrae solo la fecha
 * - Objeto Date válido → convierte a formato YYYY-MM-DD
 * - Otros valores → convierte a string
 * 
 * Esta función es crítica para asegurar que los inputs tipo "date"
 * reciban siempre el formato correcto que esperan los navegadores.
 * 
 * @function
 * @param {*} v - Valor a normalizar (puede ser Date, string, null, etc.)
 * @returns {string} Fecha en formato YYYY-MM-DD o string vacío
 * 
 * @example
 * normalizeDateValue(null) // ""
 * normalizeDateValue("2024-01-15") // "2024-01-15"
 * normalizeDateValue("2024-01-15T10:30:00Z") // "2024-01-15"
 * normalizeDateValue(new Date(2024, 0, 15)) // "2024-01-15"
 */
function normalizeDateValue(v) {
  // Caso 1: null, undefined o string vacío
  if (v == null || v === "") return "";
  
  // Caso 2: String ya en formato ISO correcto (YYYY-MM-DD)
  if (typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v)) return v;
  
  // Caso 3: String con timestamp ISO (contiene "T")
  // Extrae solo la parte de la fecha antes de la "T"
  if (typeof v === "string" && v.includes("T")) return v.split("T")[0];

  // Caso 4: Objeto Date válido
  if (v instanceof Date && !Number.isNaN(v.getTime())) {
    const yyyy = v.getFullYear();
    // getMonth() retorna 0-11, por eso sumamos 1
    const mm = String(v.getMonth() + 1).padStart(2, "0");
    const dd = String(v.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }

  // Caso 5: Cualquier otro valor, convertir a string
  return String(v);
}

/**
 * Componente de campo de entrada multifuncional y altamente configurable.
 * 
 * Soporta múltiples tipos de entrada:
 * - Input text, number, email, password, date, time, etc.
 * - Textarea para texto multilínea
 * - Select simple o múltiple
 * 
 * Características avanzadas:
 * - Validación de entrada en tiempo real (allow: "digits", "letters", "alphanumeric")
 * - Normalización automática de fechas
 * - Manejo de errores con estilos visuales
 * - Sanitización de entrada (previene caracteres no permitidos)
 * - Prevención de pegado de contenido no válido
 * - Soporte para selects múltiples
 * - Campos requeridos
 * - Estados deshabilitados
 * 
 * @component
 * 
 * @param {Object} props - Propiedades del componente
 * @param {string} props.label - Etiqueta del campo
 * @param {string} props.name - Nombre del campo (para formularios)
 * @param {*} props.value - Valor actual del campo
 * @param {Function} props.onChange - Callback ejecutado al cambiar el valor
 * @param {string} [props.type="text"] - Tipo de input HTML (text, email, password, date, etc.)
 * @param {string} [props.placeholder=""] - Texto placeholder
 * @param {boolean} [props.required=false] - Si el campo es obligatorio
 * @param {string} [props.error=""] - Mensaje de error a mostrar
 * @param {Array<{value: string, label: string}>} [props.options=null] - Opciones para select
 * @param {boolean} [props.multiple=false] - Si el select permite selección múltiple
 * @param {number} [props.size] - Tamaño visual del select múltiple
 * @param {boolean} [props.disabled=false] - Si el campo está deshabilitado
 * @param {string} [props.allow=null] - Tipo de caracteres permitidos ("digits", "letters", "alphanumeric")
 * @param {boolean} [props.textarea=false] - Si debe renderizar un textarea en lugar de input
 * @param {number} [props.rows=3] - Número de filas del textarea
 * @param {Object} props...rest - Demás props HTML nativas del elemento
 * 
 * @returns {JSX.Element} Label que contiene el control de entrada
 * 
 * @example
 * // Input de texto simple
 * <InputField
 *   label="Nombre"
 *   name="name"
 *   value={form.name}
 *   onChange={handleChange}
 * />
 * 
 * @example
 * // Input de fecha
 * <InputField
 *   label="Fecha de Nacimiento"
 *   name="birthdate"
 *   type="date"
 *   value={form.birthdate}
 *   onChange={handleChange}
 *   required
 * />
 * 
 * @example
 * // Input solo dígitos
 * <InputField
 *   label="Documento"
 *   name="document"
 *   value={form.document}
 *   onChange={handleChange}
 *   allow="digits"
 *   placeholder="Solo números"
 * />
 * 
 * @example
 * // Select simple
 * <InputField
 *   label="País"
 *   name="country"
 *   value={form.country}
 *   onChange={handleChange}
 *   options={[
 *     { value: "co", label: "Colombia" },
 *     { value: "mx", label: "México" }
 *   ]}
 * />
 * 
 * @example
 * // Textarea
 * <InputField
 *   label="Observaciones"
 *   name="notes"
 *   value={form.notes}
 *   onChange={handleChange}
 *   textarea
 *   rows={5}
 * />
 * 
 * @example
 * // Con error
 * <InputField
 *   label="Email"
 *   name="email"
 *   type="email"
 *   value={form.email}
 *   onChange={handleChange}
 *   error={errors.email}
 *   required
 * />
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

  allow = null, // "digits" | "letters" | "alphanumeric" | null

  textarea = false,
  rows = 3,

  ...rest
}) {
  // Determina si hay un error (convierte a booleano)
  const hasError = Boolean(error);

  /**
   * Maneja cambios en elementos select.
   * 
   * Para selects múltiples, extrae todos los valores seleccionados.
   * Para selects simples, pasa el evento tal cual.
   * 
   * @param {Event} e - Evento change del select
   */
  const handleSelectChange = (e) => {
    if (multiple) {
      // Extrae todos los valores de las opciones seleccionadas
      const values = Array.from(e.target.selectedOptions).map((opt) => opt.value);
      
      // Crea un evento sintético con el array de valores
      if (onChange) onChange({ target: { name, value: values } });
    } else {
      // Para selects simples, pasa el evento original
      if (onChange) onChange(e);
    }
  };

  // Valor para el select (maneja múltiple vs simple)
  const selectValue = multiple
    ? Array.isArray(value) // Si es múltiple, debe ser array
      ? value.map(String)  // Convierte todos los valores a string
      : []                 // Si no es array, usa array vacío
    : value ?? "";         // Si es simple, usa el valor o string vacío

  // Valor para inputs (normaliza fechas)
  const inputValue = type === "date" 
    ? normalizeDateValue(value) // Normaliza fechas al formato correcto
    : value ?? "";              // Otros tipos usan valor directo o string vacío

  /**
   * Determina si una tecla es de control (no debe ser bloqueada).
   * 
   * Permite:
   * - Modificadores: Ctrl, Meta, Alt
   * - Teclas de navegación: flechas, Home, End
   * - Teclas de edición: Backspace, Delete, Tab, Enter, Escape
   * 
   * @param {KeyboardEvent} e - Evento de teclado
   * @returns {boolean} true si es tecla de control
   */
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

  /**
   * Sanitiza un string según la restricción "allow".
   * 
   * Remueve caracteres no permitidos:
   * - "digits": solo números (0-9)
   * - "letters": solo letras (incluyendo acentos y ñ)
   * - "alphanumeric": solo letras y números
   * 
   * @param {*} raw - Valor a sanitizar
   * @returns {string} Valor sanitizado
   */
  const sanitize = (raw) => {
    const v = String(raw ?? "");
    if (!allow) return v;

    if (allow === "digits") return v.replace(/\D+/g, ""); // Remueve todo excepto dígitos
    if (allow === "letters") return v.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+/g, ""); // Solo letras y espacios
    if (allow === "alphanumeric") return v.replace(/[^a-zA-Z0-9]+/g, ""); // Solo letras y números
    return v;
  };

  /**
   * Previene entrada de caracteres no permitidos en tiempo real.
   * 
   * Bloquea teclas que no cumplen con la restricción "allow",
   * excepto teclas de control.
   * 
   * @param {KeyboardEvent} e - Evento de tecla presionada
   */
  const handleKeyDown = (e) => {
    if (!allow) return; // Si no hay restricción, permite todo
    if (isControlKey(e)) return; // Siempre permite teclas de control

    const key = e.key;

    // Bloquea según el tipo de restricción
    if (allow === "digits" && !/^\d$/.test(key)) e.preventDefault();
    if (allow === "letters" && !/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]$/.test(key)) e.preventDefault();
    if (allow === "alphanumeric" && !/^[a-zA-Z0-9]$/.test(key)) e.preventDefault();
  };

  /**
   * Previene pegado de contenido no permitido.
   * 
   * Sanitiza el texto pegado y previene el pegado
   * si contiene caracteres no permitidos.
   * 
   * @param {ClipboardEvent} e - Evento de pegado
   */
  const handlePaste = (e) => {
    if (!allow) return;

    // Obtiene el texto del portapapeles
    const text = e.clipboardData?.getData("text") ?? "";
    
    // Sanitiza el texto
    const cleaned = sanitize(text);

    // Si el texto sanitizado es diferente, previene el pegado
    // (el usuario pegó caracteres no permitidos)
    if (cleaned !== text) e.preventDefault();
  };

  /**
   * Maneja cambios en inputs y textareas.
   * 
   * Aplica sanitización si hay restricción "allow".
   * 
   * @param {Event} e - Evento change
   */
  const handleInputChange = (e) => {
    if (!onChange) return;

    if (!allow) {
      // Sin restricción, pasa el evento tal cual
      onChange(e);
      return;
    }

    // Con restricción, sanitiza el valor
    const cleaned = sanitize(e.target.value);
    
    // Crea evento sintético con valor sanitizado
    onChange({ target: { name, value: cleaned } });
  };

  return (
    // Label que actúa como contenedor (permite click en label para enfocar input)
    // Clase dinámica: agrega --error si hay error
    <label className={`input-field ${hasError ? "input-field--error" : ""}`}>
      
      {/* Etiqueta del campo */}
      <span className="input-field__label">{label}</span>

      {/* Renderiza SELECT si options está definido */}
      {options ? (
        <select
          className="input-field__control"
          name={name}
          value={selectValue}
          onChange={handleSelectChange}
          required={required}
          multiple={multiple}
          // size: altura visual del select múltiple (número de opciones visibles)
          size={multiple ? size ?? 6 : undefined}
          disabled={disabled}
          {...rest}
        >
          {/* Opción vacía solo para selects simples */}
          {!multiple && <option value="">{placeholder || "Seleccione..."}</option>}
          
          {/* Mapea las opciones */}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ) : textarea ? (
        /* Renderiza TEXTAREA si textarea es true */
        <textarea
          className="input-field__control input-field__control--textarea"
          name={name}
          value={inputValue}
          onChange={handleInputChange}
          // Event handlers solo si hay restricción "allow"
          onKeyDown={allow ? handleKeyDown : undefined}
          onPaste={allow ? handlePaste : undefined}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          rows={rows}
          {...rest}
        />
      ) : (
        /* Renderiza INPUT por defecto */
        <input
          className="input-field__control"
          name={name}
          type={type}
          value={inputValue}
          onChange={handleInputChange}
          // Event handlers solo si hay restricción "allow"
          onKeyDown={allow ? handleKeyDown : undefined}
          onPaste={allow ? handlePaste : undefined}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          autoComplete="off" // Desactiva autocompletado del navegador
          // inputMode="numeric": teclado numérico en móviles para campos de dígitos
          inputMode={allow === "digits" ? "numeric" : undefined}
          {...rest}
        />
      )}

      {/* Mensaje de error - solo se muestra si hasError es true */}
      {hasError ? <span className="input-field__error">{error}</span> : null}
    </label>
  );
}