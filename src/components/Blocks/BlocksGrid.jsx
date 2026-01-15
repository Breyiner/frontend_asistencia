import "./BlocksGrid.css";
import Card from "../Card/Card";

export default function BlocksGrid({ header, left = [], right = [], side = [], footer }) {
    const hasRight = Array.isArray(right) && right.length > 0;

    return (
        <div className="blocks-grid">
            <div className="blocks-grid__main">
                <Card variant="default" className="blocks-grid__main-card">
                    {header ? <div className="blocks-grid__header">{header}</div> : null}

                    <div className={`blocks-grid__cols ${hasRight ? "" : "blocks-grid__cols--single"}`}>
                        <div className="blocks-grid__col">
                            {left.map((b, idx) => (
                                <section key={idx} className="blocks-grid__block">
                                    {b.title ? <h3 className="blocks-grid__title">{b.title}</h3> : null}
                                    <div className="blocks-grid__content">{b.content}</div>
                                </section>
                            ))}
                        </div>

                        {hasRight ? (
                            <div className="blocks-grid__col">
                                {right.map((b, idx) => (
                                    <section key={idx} className="blocks-grid__block">
                                        {b.title ? <h3 className="blocks-grid__title">{b.title}</h3> : null}
                                        <div className="blocks-grid__content">{b.content}</div>
                                    </section>
                                ))}
                            </div>
                        ) : null}
                    </div>

                    {footer ? <div className="blocks-grid__footer">{footer}</div> : null}
                </Card>
            </div>

            {side?.length ? (
                <aside className="blocks-grid__side">
                    {side.map((c, idx) => (
                        <Card key={idx} title={c.title} variant={c.variant || "default"}>
                            {c.content}
                        </Card>
                    ))}
                </aside>
            ) : null}
        </div>
    );
}
