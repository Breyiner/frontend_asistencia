import React, { useEffect } from "react";
import "./ClassTip.css";

export default function ClassTip({ id, info }) {

    useEffect(() => {
        const cells = document.querySelectorAll('.att-cell');

        const handleMouseEnter = (e) => {
            const cell = e.currentTarget;
            const btn = cell.querySelector('.att-cell__btn');
            const tip = cell.querySelector('.class-tip');

            if (!btn || !tip) return;

            const rect = btn.getBoundingClientRect();
            tip.style.left = `${rect.left + rect.width / 2}px`;
            tip.style.top = `${rect.top - 280}px`;
            tip.style.opacity = '1';
            tip.style.visibility = 'visible';
        };

        const handleMouseLeave = (e) => {
            const cell = e.currentTarget;
            const tip = cell.querySelector('.class-tip');

            if (tip) {
                tip.style.opacity = '0';
                tip.style.visibility = 'hidden';
            }
        };

        cells.forEach(cell => {
            cell.addEventListener('mouseenter', handleMouseEnter);
            cell.addEventListener('mouseleave', handleMouseLeave);
        });

        return () => {
            cells.forEach(cell => {
                cell.removeEventListener('mouseenter', handleMouseEnter);
                cell.removeEventListener('mouseleave', handleMouseLeave);
            });
        };
    }, []);

    return (
        <div className="class-tip" id={id} role="tooltip">
            <div className="class-tip__title">Clase</div>
            <div className="class-tip__grid">
                <div className="class-tip__label">Fecha</div>
                <div className="class-tip__value">{info.date}</div>

                <div className="class-tip__label">Jornada</div>
                <div className="class-tip__value">{info.shift}</div>

                <div className="class-tip__label">Hora</div>
                <div className="class-tip__value">{`${info.start} - ${info.end}`}</div>

                <div className="class-tip__label">Instructor</div>
                <div className="class-tip__value">{info.instructor}</div>

                <div className="class-tip__label">Tipo</div>
                <div className="class-tip__value">{info.classType}</div>

                <div className="class-tip__label">Ambiente</div>
                <div className="class-tip__value">{info.classroom}</div>

                <div className="class-tip__label">Estado</div>
                <div className="class-tip__value">{info.statusLabel}</div>

                <div className="class-tip__label">Hrs. Ausente</div>
                <div className="class-tip__value">{info.absent_hours}</div>

                <div className="class-tip__label">Obs.</div>
                <div className="class-tip__value">{info.observations}</div>
            </div>
        </div>
    );
}
