// Importa React y el hook useEffect para efectos secundarios
import React, { useEffect } from "react";

// Importa los estilos del tooltip de clase
import "./ClassTip.css";

/**
 * Componente de tooltip para mostrar información detallada de una clase.
 * 
 * Muestra un tooltip flotante con información completa de una clase cuando
 * el usuario hace hover sobre una celda de asistencia en la tabla.
 * El tooltip se posiciona dinámicamente sobre el botón usando JavaScript.
 * 
 * Información mostrada:
 * - Fecha de la clase
 * - Jornada (mañana/tarde)
 * - Horario (hora inicio - hora fin)
 * - Instructor
 * - Tipo de clase
 * - Ambiente/salón
 * - Estado de asistencia
 * - Horas ausente
 * - Observaciones
 * 
 * El posicionamiento se maneja mediante event listeners de mouseenter/mouseleave
 * que calculan la posición del tooltip basándose en las coordenadas del botón.
 * 
 * @component
 * 
 * @param {Object} props - Propiedades del componente
 * @param {string} props.id - ID único del tooltip para accesibilidad (aria-describedby)
 * @param {Object} props.info - Objeto con información de la clase
 * @param {string} props.info.date - Fecha de la clase
 * @param {string} props.info.shift - Jornada (ej: "Mañana", "Tarde")
 * @param {string} props.info.start - Hora de inicio
 * @param {string} props.info.end - Hora de fin
 * @param {string} props.info.instructor - Nombre del instructor
 * @param {string} props.info.classType - Tipo de clase
 * @param {string} props.info.classroom - Ambiente/salón
 * @param {string} props.info.statusLabel - Estado de asistencia legible
 * @param {string|number} props.info.absent_hours - Horas ausente
 * @param {string} props.info.observations - Observaciones adicionales
 * 
 * @returns {JSX.Element} Tooltip con grid de información de la clase
 * 
 * @example
 * <ClassTip
 *   id="tooltip-123"
 *   info={{
 *     date: "2024-01-15",
 *     shift: "Mañana",
 *     start: "08:00",
 *     end: "12:00",
 *     instructor: "Juan Pérez",
 *     classType: "Teórica",
 *     classroom: "Ambiente 301",
 *     statusLabel: "Presente",
 *     absent_hours: "0",
 *     observations: "Participó activamente"
 *   }}
 * />
 */
export default function ClassTip({ id, info }) {

    // useEffect para agregar/remover event listeners de hover
    // Se ejecuta una vez al montar el componente (array de dependencias vacío)
    useEffect(() => {
        // Selecciona todas las celdas de asistencia en el documento
        const cells = document.querySelectorAll('.att-cell');

        /**
         * Maneja el evento mouseenter (hover sobre la celda).
         * 
         * Calcula la posición del tooltip basándose en las coordenadas
         * del botón y lo hace visible con transición de opacidad.
         * 
         * @param {MouseEvent} e - Evento de mouse
         */
        const handleMouseEnter = (e) => {
            // Obtiene la celda actual
            const cell = e.currentTarget;
            
            // Busca el botón y el tooltip dentro de la celda
            const btn = cell.querySelector('.att-cell__btn');
            const tip = cell.querySelector('.class-tip');

            // Si no existen ambos elementos, no hace nada
            if (!btn || !tip) return;

            // Obtiene las coordenadas y dimensiones del botón
            const rect = btn.getBoundingClientRect();
            
            // Posiciona el tooltip:
            // - Horizontalmente: centrado sobre el botón
            // - Verticalmente: 280px arriba del botón
            tip.style.left = `${rect.left + rect.width / 2}px`;
            tip.style.top = `${rect.top - 280}px`;
            
            // Hace visible el tooltip con transición suave
            tip.style.opacity = '1';
            tip.style.visibility = 'visible';
        };

        /**
         * Maneja el evento mouseleave (salir del hover).
         * 
         * Oculta el tooltip con transición de opacidad.
         * 
         * @param {MouseEvent} e - Evento de mouse
         */
        const handleMouseLeave = (e) => {
            // Obtiene la celda actual
            const cell = e.currentTarget;
            
            // Busca el tooltip dentro de la celda
            const tip = cell.querySelector('.class-tip');

            // Si existe el tooltip, lo oculta
            if (tip) {
                tip.style.opacity = '0';
                tip.style.visibility = 'hidden';
            }
        };

        // Agrega los event listeners a todas las celdas
        cells.forEach(cell => {
            cell.addEventListener('mouseenter', handleMouseEnter);
            cell.addEventListener('mouseleave', handleMouseLeave);
        });

        // Función de limpieza: remueve los event listeners al desmontar
        // Esto previene memory leaks
        return () => {
            cells.forEach(cell => {
                cell.removeEventListener('mouseenter', handleMouseEnter);
                cell.removeEventListener('mouseleave', handleMouseLeave);
            });
        };
    }, []); // Array vacío = solo se ejecuta al montar/desmontar

    return (
        // Contenedor del tooltip con role="tooltip" para accesibilidad
        // Inicialmente invisible (CSS lo controla)
        <div className="class-tip" id={id} role="tooltip">
            
            {/* Título del tooltip */}
            <div className="class-tip__title">Clase</div>
            
            {/* Grid con la información en formato clave-valor */}
            <div className="class-tip__grid">
                
                {/* Fila: Fecha */}
                <div className="class-tip__label">Fecha</div>
                <div className="class-tip__value">{info.date}</div>

                {/* Fila: Jornada */}
                <div className="class-tip__label">Jornada</div>
                <div className="class-tip__value">{info.shift}</div>

                {/* Fila: Horario (hora inicio - hora fin) */}
                <div className="class-tip__label">Hora</div>
                <div className="class-tip__value">{`${info.start} - ${info.end}`}</div>

                {/* Fila: Instructor */}
                <div className="class-tip__label">Instructor</div>
                <div className="class-tip__value">{info.instructor}</div>

                {/* Fila: Tipo de clase */}
                <div className="class-tip__label">Tipo</div>
                <div className="class-tip__value">{info.classType}</div>

                {/* Fila: Ambiente/salón */}
                <div className="class-tip__label">Ambiente</div>
                <div className="class-tip__value">{info.classroom}</div>

                {/* Fila: Estado de asistencia */}
                <div className="class-tip__label">Estado</div>
                <div className="class-tip__value">{info.statusLabel}</div>

                {/* Fila: Horas ausente */}
                <div className="class-tip__label">Hrs. Ausente</div>
                <div className="class-tip__value">{info.absent_hours}</div>

                {/* Fila: Observaciones */}
                <div className="class-tip__label">Obs.</div>
                <div className="class-tip__value">{info.observations}</div>
            </div>
        </div>
    );
}