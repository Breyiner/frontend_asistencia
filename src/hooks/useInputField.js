import { useCallback } from "react";

/**
 * Encapsula toda la lógica de validación, sanitización y manejo de eventos
 * de un campo de entrada. Separa el comportamiento del componente visual.
 *
 * @param {object}   params
 * @param {string}   params.name      Nombre del campo para eventos sintéticos.
 * @param {*}        params.value     Valor controlado actual del campo.
 * @param {Function} params.onChange  Callback que recibe el evento sintético.
 * @param {string}   params.type      Tipo de input HTML.
 * @param {boolean}  params.multiple  Si el select permite selección múltiple.
 * @param {string}   params.allow     Restricción de caracteres: "digits" | "letters" | "alphanumeric".
 * @param {number}   params.max       Máximo de caracteres permitidos.
 * @param {Array}    params.options   Opciones del combo (react-select).
 * @param {boolean}  params.isMulti   Selección múltiple en react-select.
 */
export function useInputField({ name, value, onChange, type, multiple, allow, max, options, isMulti }) {

  // ─── Helpers ──────────────────────────────────────────────────────────────

  /**
   * Retorna true si la tecla es de navegación o edición estructural,
   * por lo que no debe ser bloqueada por restricciones de contenido.
   */
  const isControlKey = (e) =>
    e.ctrlKey || e.metaKey || e.altKey ||
    ["Backspace", "Delete", "Tab", "Enter", "Escape",
      "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End",
    ].includes(e.key);

  /**
   * Elimina los caracteres que no corresponden a la restricción `allow`.
   * Si `allow` es null, retorna el string sin modificar.
   */
  const sanitize = (raw) => {
    const v = String(raw ?? "");
    if (!allow) return v;
    if (allow === "digits")       return v.replace(/\D+/g, "");
    if (allow === "letters")      return v.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+/g, "");
    if (allow === "alphanumeric") return v.replace(/[^a-zA-Z0-9]+/g, "");
    return v;
  };

  /**
   * Indica si el campo ya alcanzó el límite de caracteres definido por `max`.
   * No aplica sobre inputs tipo "date" porque el navegador gestiona su formato.
   */
  const isAtMax = () =>
    max != null && type !== "date" && String(value ?? "").length >= max;

  // ─── Handlers: select nativo ──────────────────────────────────────────────

  /**
   * Para selects múltiples extrae todos los valores seleccionados del DOM
   * y emite un evento sintético con un array. Para selects simples reenvía
   * el evento original sin transformación.
   */
  const handleSelectChange = useCallback((e) => {
    if (!onChange) return;
    if (multiple) {
      const values = Array.from(e.target.selectedOptions).map((opt) => opt.value);
      onChange({ target: { name, value: values } });
    } else {
      onChange(e);
    }
  }, [name, onChange, multiple]);

  // ─── Handlers: input y textarea ───────────────────────────────────────────

  /**
   * Bloquea la tecla en tiempo real si:
   * - el caracter excedería el límite `max`, o
   * - el caracter no está permitido por la restricción `allow`.
   * Las teclas de control siempre se permiten.
   */
  const handleKeyDown = useCallback((e) => {
    if (isControlKey(e)) return;

    if (isAtMax() && e.key.length === 1) {
      e.preventDefault();
      return;
    }

    if (!allow) return;
    const key = e.key;
    if (allow === "digits"       && !/^\d$/.test(key))                        e.preventDefault();
    if (allow === "letters"      && !/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]$/.test(key))  e.preventDefault();
    if (allow === "alphanumeric" && !/^[a-zA-Z0-9]$/.test(key))              e.preventDefault();
  }, [allow, value, max, type]);

  /**
   * Cancela el pegado si el texto del clipboard:
   * - haría que el valor total supere `max`, o
   * - contiene caracteres no permitidos por `allow`.
   */
  const handlePaste = useCallback((e) => {
    const text = e.clipboardData?.getData("text") ?? "";
    const currentLength = String(value ?? "").length;

    if (max != null && type !== "date" && currentLength + text.length > max) {
      e.preventDefault();
      return;
    }

    if (allow && sanitize(text) !== text) {
      e.preventDefault();
    }
  }, [allow, value, max, type]);

  /**
   * Aplica sanitización y truncado al cambiar el valor.
   * El truncado a `max` actúa como red de seguridad frente a autocompletado
   * del navegador u otras fuentes externas que eviten keyDown/paste.
   */
  const handleInputChange = useCallback((e) => {
    if (!onChange) return;

    let newValue = e.target.value;

    if (max != null && type !== "date") {
      newValue = newValue.slice(0, max);
    }

    if (!allow) {
      onChange({ target: { name, value: newValue } });
      return;
    }

    onChange({ target: { name, value: sanitize(newValue) } });
  }, [name, onChange, allow, max, type]);

  // ─── Handlers: combobox (react-select) ────────────────────────────────────

  /**
   * Normaliza la selección de react-select a un evento sintético consistente
   * con los demás controles del componente.
   * - Single: emite string (o string vacío si se limpia).
   * - Multi: emite array de strings.
   */
  const handleComboChange = useCallback((selectedOptions) => {
    if (!onChange) return;

    const values = Array.isArray(selectedOptions)
      ? selectedOptions.map((opt) => opt.value)
      : selectedOptions?.value ? [selectedOptions.value] : [];

    onChange({
      target: {
        name,
        value: isMulti ? values : values[0] ?? "",
      },
    });
  }, [name, onChange, isMulti]);

  // ─── Valores derivados ────────────────────────────────────────────────────

  /**
   * Valor normalizado para el select nativo.
   * El select múltiple requiere un array de strings; el simple usa string vacío como fallback.
   */
  const selectValue = multiple
    ? Array.isArray(value) ? value.map(String) : []
    : value ?? "";

  /**
   * Valor seleccionado para react-select en formato de objeto(s) { value, label }.
   * Soporta single y multi.
   */
  const comboSelected = Array.isArray(value)
    ? options?.filter((o) => value.some((v) => String(v) === String(o.value))) ?? []
    : options?.find((o) => String(o.value) === String(value)) ?? null;

  return {
    selectValue,
    comboSelected,
    handleSelectChange,
    handleKeyDown,
    handlePaste,
    handleInputChange,
    handleComboChange,
  };
}
