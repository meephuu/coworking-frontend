//Plain horizontal bars (black on white) for the statistics page
export default function BarList({ rows, valueSuffix = '' }) {
    const max = Math.max(1, ...rows.map((r) => r.value));

    return (
        <div className="bars">
            {rows.map((r) => (
                <div className="bar-row" key={r.label}>
                    <span className="bar-label">{r.label}</span>
                    <span className="bar-track">
                        <span className="bar-fill" style={{ width: `${(r.value / max) * 100}%` }} />
                    </span>
                    <span className="bar-value">{r.value}{valueSuffix}</span>
                </div>
            ))}
        </div>
    );
}
