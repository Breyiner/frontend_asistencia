// Importa hooks de React
import { useMemo, useState, useEffect } from "react";

// Importa componentes reutilizables
import TextField from "../InputField/InputField";
import Button from "../Button/Button";

// Importa iconos de Remix Icon
import {
  RiFilterLine,      // Icono de filtro
  RiCloseLine,       // Icono de cerrar/limpiar
  RiSearchLine,      // Icono de búsqueda
  RiArrowDownSLine,  // Flecha abajo
  RiArrowUpSLine,    // Flecha arriba
} from "@remixicon/react";

// Importa estilos del componente de filtros
import "./ListFilters.css";

/**
 * Componente de filtros para listas de datos.
 * 
 * Proporciona una interfaz flexible de filtrado con:
 * - Filtros primarios: siempre visibles
 * - Filtros avanzados: colapsables (expandibles con botón)
 * - Búsqueda con icono opcional
 * - Botones de filtrar y limpiar
 * - Soporte para inputs de texto, selects y fechas
 * 
 * Características:
 * - Configuración declarativa mediante array de config
 * - Valores por defecto configurables
 * - Reseteo automático al cambiar configuración
 * - Estados deshabilitados
 * - Envío mediante formulario (Enter)
 * 
 * @component
 * 
 * @param {Object} props - Propiedades del componente
 * @param {Array<Object>} [props.config=[]] - Configuración de filtros
 * @param {string} props.config[].name - Nombre del campo de filtro
 * @param {string} props.config[].label - Etiqueta visible del filtro
 * @param {string} [props.config[].type="text"] - Tipo de input (text, select, date, etc.)
 * @param {string} [props.config[].placeholder] - Placeholder del input
 * @param {*} [props.config[].defaultValue] - Valor por defecto
 * @param {boolean} [props.config[].advanced=false] - Si es filtro avanzado (colapsable)
 * @param {boolean} [props.config[].disabled=false] - Si está deshabilitado
 * @param {boolean} [props.config[].withSearchIcon=false] - Si muestra icono de búsqueda
 * @param {Array} [props.config[].options] - Opciones para select
 * @param {Function} props.onChange - Callback ejecutado al filtrar o limpiar
 * 
 * @returns {JSX.Element} Formulario de filtros
 * 
 * @example
 * // Filtros simples
 * <ListFilters
 *   config={[
 *     { 
 *       name: "search", 
 *       label: "Buscar", 
 *       type: "text",
 *       placeholder: "Nombre o documento...",
 *       withSearchIcon: true
 *     },
 *     { 
 *       name: "status", 
 *       label: "Estado", 
 *       type: "select",
 *       options: [
 *         { value: "active", label: "Activo" },
 *         { value: "inactive", label: "Inactivo" }
 *       ]
 *     }
 *   ]}
 *   onChange={(filters) => handleFilter(filters)}
 * />
 * 
 * @example
 * // Con filtros avanzados
 * <ListFilters
 *   config={[
 *     { name: "search", label: "Buscar", type: "text" },
 *     { name: "created_from", label: "Desde", type: "date", advanced: true },
 *     { name: "created_to", label: "Hasta", type: "date", advanced: true }
 *   ]}
 *   onChange={handleFilter}
 * />
 */
export default function ListFilters({ config = [], onChange }) {
  
  /**
   * Valores iniciales de filtros basados en defaultValue de cada campo.
   * 
   * Crea un objeto con todos los campos inicializados a su defaultValue
   * o string vacío si no tienen defaultValue.
   * 
   * useMemo evita recrear el objeto en cada render si config no cambia.
   */
  const initialFilters = useMemo(() => {
    return config.reduce(
      (acc, f) => ({ ...acc, [f.name]: f.defaultValue ?? "" }),
      {}
    );
  }, [config]);

  // Estado de los valores actuales de los filtros
  const [filters, setFilters] = useState(initialFilters);
  
  // Estado para controlar expansión de filtros avanzados
  const [expanded, setExpanded] = useState(false);

  // Efecto: resetea filtros cuando cambia la configuración inicial
  useEffect(() => {
    setFilters(initialFilters);
  }, [initialFilters]);

  /**
   * Filtros primarios (siempre visibles).
   * 
   * Son aquellos que no tienen la propiedad advanced: true.
   * useMemo evita recalcular en cada render.
   */
  const primaryFilters = useMemo(() => config.filter((f) => !f.advanced), [config]);
  
  /**
   * Filtros avanzados (colapsables).
   * 
   * Son aquellos que tienen advanced: true.
   * useMemo evita recalcular en cada render.
   */
  const advancedFilters = useMemo(() => config.filter((f) => f.advanced), [config]);

  /**
   * Maneja cambios en cualquier campo de filtro.
   * 
   * Actualiza el estado de filtros con el nuevo valor.
   * 
   * @param {Event} e - Evento change del input
   */
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  /**
   * Maneja el envío del formulario.
   * 
   * Previene comportamiento por defecto y ejecuta onChange
   * con los valores actuales de los filtros.
   * 
   * @param {Event} e - Evento submit del formulario
   */
  const handleSubmit = (e) => {
    e.preventDefault(); // Previene recarga de página
    
    // Ejecuta callback si existe (optional chaining)
    onChange?.(filters);
  };

  /**
   * Limpia todos los filtros a sus valores por defecto.
   * 
   * Resetea cada campo a su defaultValue o string vacío,
   * actualiza el estado y ejecuta onChange con valores limpios.
   */
  const handleClear = () => {
    // Crea objeto con valores por defecto
    const cleared = config.reduce(
      (acc, f) => ({ ...acc, [f.name]: f.defaultValue ?? "" }),
      {}
    );
    
    // Actualiza estado
    setFilters(cleared);
    
    // Notifica al padre con valores limpios
    onChange?.(cleared);
  };

  /**
   * Renderiza un campo de filtro según su configuración.
   * 
   * Determina si es select o input y renderiza el InputField apropiado.
   * 
   * @param {Object} field - Configuración del campo
   * @returns {JSX.Element} InputField configurado
   */
  const renderField = (field) => {
    const isSelect = field.type === "select";

    return (
      <TextField
        key={field.name}
        name={field.name}
        label={field.label}
        value={filters[field.name] ?? ""}
        onChange={handleInputChange}
        placeholder={field.placeholder}
        disabled={field.disabled}
        // Props específicas de select
        select={isSelect}
        options={isSelect ? field.options || [] : undefined}
        // Props específicas de input
        type={!isSelect ? field.type || "text" : undefined}
        // Icono de búsqueda opcional
        leftIcon={field.withSearchIcon ? <RiSearchLine size={18} /> : null}
      />
    );
  };

  return (
    // Formulario con autoComplete="off" para evitar sugerencias del navegador
    <form className="data-filters" onSubmit={handleSubmit} autoComplete="off">
      
      {/* Fila principal con filtros primarios y acciones */}
      <div className="data-filters__row">
        
        {/* Contenedor de filtros primarios (siempre visibles) */}
        <div className="data-filters__primary">
          {/* Renderiza cada filtro primario */}
          {primaryFilters.map(renderField)}
        </div>

        {/* Contenedor de botones de acción */}
        <div className="data-filters__actions">
          
          {/* Botón de expandir/contraer filtros avanzados
              Solo se muestra si hay filtros avanzados configurados */}
          {advancedFilters.length > 0 && (
            <Button
              type="button"
              variant="secondary"
              onClick={() => setExpanded((v) => !v)} // Alterna estado
            >
              {/* Texto e icono dinámicos según estado de expansión */}
              {expanded ? (
                <>
                  Menos filtros <RiArrowUpSLine size={16} />
                </>
              ) : (
                <>
                  Más filtros <RiArrowDownSLine size={16} />
                </>
              )}
            </Button>
          )}

          {/* Botón de filtrar (submit del formulario) */}
          <Button type="submit" variant="primary">
            <RiFilterLine size={18} />
            Filtrar
          </Button>

          {/* Botón de limpiar filtros */}
          <Button type="button" variant="secondary" onClick={handleClear}>
            <RiCloseLine size={16} />
            Limpiar
          </Button>
        </div>
      </div>

      {/* Sección de filtros avanzados - solo visible si expanded es true
          Renderizado condicional con && */}
      {expanded && advancedFilters.length > 0 && (
        <div className="data-filters__advanced">
          {/* Fila compacta para filtros avanzados */}
          <div className="data-filters__row data-filters__row--compact">
            {/* Renderiza cada filtro avanzado */}
            {advancedFilters.map(renderField)}
          </div>
        </div>
      )}
    </form>
  );
}