// Importa los estilos específicos de la mini tarjeta de asistencia
import "./AttendanceMiniCard.css";

// Importa estilos de badges (etiquetas) usados en el componente
import "../Badge/Badge.css";

// Importa iconos de Remix Icon para representar diferentes estados
import {
  RiCheckboxCircleLine,  // Icono de check para "presente"
  RiCloseCircleLine,     // Icono de X para "ausente"
  RiShieldCheckLine,     // Icono de escudo para "ausencia justificada"
  RiTimeLine,            // Icono de reloj para "tarde"
  RiLogoutCircleRLine,   // Icono de salida para "salida temprana"
  RiQuestionLine,        // Icono de pregunta para "sin registrar"
  RiArrowRightSLine,     // Icono de flecha para indicar acción
} from "@remixicon/react";

// Importa componente para mostrar badges de forma compacta
import BadgesCompact from "../BadgesCompact/BadgesCompact";

/**
 * Objeto de configuración de UI por código de estado de asistencia.
 * 
 * Define la apariencia visual de cada estado:
 * - tone: Color/tema del estado (success, danger, warning, etc.)
 * - Icon: Componente de icono de Remix Icon correspondiente
 * 
 * @constant
 * @type {Object.<string, {tone: string, Icon: React.Component}>}
 */
const STATUS_UI = {
  present: { tone: "success", Icon: RiCheckboxCircleLine },          // Verde - Presente
  absent: { tone: "danger", Icon: RiCloseCircleLine },               // Rojo - Ausente
  excused_absence: { tone: "purple", Icon: RiShieldCheckLine },      // Morado - Ausencia justificada
  late: { tone: "warning", Icon: RiTimeLine },                       // Amarillo - Tarde
  early_exit: { tone: "info", Icon: RiLogoutCircleRLine },           // Azul - Salida temprana
  unregistered: { tone: "neutral", Icon: RiQuestionLine },           // Gris - Sin registrar
};

/**
 * Componente de tarjeta compacta para mostrar información de asistencia de un aprendiz.
 * 
 * Renderiza una tarjeta clickeable que muestra:
 * - Icono de estado de asistencia con color correspondiente
 * - Nombre completo del aprendiz
 * - Observaciones/descripción (si existen)
 * - Badge con el nombre del estado
 * - Icono de flecha indicando que es clickeable
 * 
 * La tarjeta completa es un botón que permite seleccionar/ver detalles
 * de la asistencia del aprendiz.
 * 
 * @component
 * 
 * @param {Object} props - Propiedades del componente
 * @param {Object} props.attendance - Objeto con datos de asistencia del aprendiz
 * @param {string} props.attendance.apprentice_full_name - Nombre completo del aprendiz
 * @param {Object} props.attendance.attendance_status - Objeto del estado de asistencia
 * @param {string} props.attendance.attendance_status.code - Código del estado (present, absent, etc.)
 * @param {string} props.attendance.attendance_status.name - Nombre legible del estado
 * @param {string} [props.attendance.observations] - Observaciones o descripción adicional
 * @param {Function} [props.onSelect] - Callback ejecutado al hacer click en la tarjeta
 * 
 * @returns {JSX.Element} Botón con formato de tarjeta mini de asistencia
 * 
 * @example
 * <AttendanceMiniCard
 *   attendance={{
 *     apprentice_full_name: "Juan Pérez",
 *     attendance_status: { code: "late", name: "Tarde" },
 *     observations: "Llegó 15 minutos tarde"
 *   }}
 *   onSelect={(attendance) => openEditModal(attendance)}
 * />
 */
export default function AttendanceMiniCard({ attendance, onSelect }) {
  
  // Extrae el nombre completo del aprendiz o usa "—" como valor por defecto
  const fullName = attendance?.apprentice_full_name || "—";
  
  // Extrae el objeto de estado de asistencia o usa objeto vacío como default
  const status = attendance?.attendance_status || {};
  
  // Extrae el código del estado o usa "unregistered" como default
  const code = status?.code || "unregistered";
  
  // Extrae el nombre del estado o usa "Sin Registrar" como default
  const statusName = status?.name || "Sin Registrar";
  
  // Extrae las observaciones o usa string vacío como default
  const observations = attendance?.observations || "";

  // Obtiene la configuración de UI para el código de estado actual
  // Si el código no existe en STATUS_UI, usa la configuración de "unregistered"
  const ui = STATUS_UI[code] || STATUS_UI.unregistered;
  
  // Extrae el componente de icono de la configuración UI
  const Icon = ui.Icon;

  return (
    // Botón que representa toda la tarjeta (clickeable)
    // type="button" previene que actúe como submit en formularios
    // La clase incluye el tono del estado para aplicar colores correspondientes
    <button
      type="button"
      className={`attendance-mini attendance-mini--${ui.tone}`}
      onClick={() => onSelect?.(attendance)} // Llama a onSelect si existe, pasando el objeto attendance
    >
      {/* Lado izquierdo: icono y texto */}
      <div className="attendance-mini__left">
        
        {/* Contenedor del icono con color según el tono del estado */}
        <div className={`attendance-mini__icon attendance-mini__icon--${ui.tone}`}>
          {/* Renderiza el icono dinámico con tamaño 22px */}
          <Icon size={22} />
        </div>

        {/* Contenedor del texto: nombre y observaciones */}
        <div className="attendance-mini__text">
          {/* Nombre completo del aprendiz */}
          <div className="attendance-mini__name">{fullName}</div>
          
          {/* Observaciones - solo se muestra si existen
              Renderizado condicional: si observations es truthy, muestra el div */}
          {observations ? <div className="attendance-mini__obs">{observations}</div> : null}
        </div>
      </div>

      {/* Lado derecho: badge de estado y chevron */}
      <div className="attendance-mini__right">
        
        {/* Componente de badges compactos
            - items: array con el nombre del estado
            - maxVisible: muestra solo 1 badge
            - badgeClassName: clase CSS con color según el tono
            - moreClassName: clase para el badge de "más items" (no usado aquí porque maxVisible=1) */}
        <BadgesCompact
          items={[statusName]}
          maxVisible={1}
          badgeClassName={`badge badge--fill-${ui.tone}`}
          moreClassName="badge badge--fill-neutral"
        />
        
        {/* Icono de flecha derecha indicando que es clickeable/navegable
            aria-hidden="true" porque es decorativo */}
        <span className="attendance-mini__chevron" aria-hidden="true">
          <RiArrowRightSLine size={20} />
        </span>
      </div>
    </button>
  );
}