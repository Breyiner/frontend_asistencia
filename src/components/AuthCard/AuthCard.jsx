import "./AuthCard.css";

export default function AuthCard({ left, title, subtitle, children }) {
    return (
        <div className="auth-card">
            <div className="auth-card__left">{left}</div>

            <div className="auth-card__right">
                <div className="auth-card_rightHeader">

                    <h2 className="auth-card__title">{title}</h2>
                    {subtitle && <p className="auth-card__subtitle">{subtitle}</p>}
                </div>
                {children}
            </div>


        </div>
    );
}
