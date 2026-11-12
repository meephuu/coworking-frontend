//Simple vertical bars; rows are { label, value, title? }. Labels are thinned out so they do not overlap
export default function ColumnChart({ rows, height = 140 }) {
    const max = Math.max(1, ...rows.map((r) => r.value));
    const step = Math.ceil(rows.length / 12);

    return (
        <div className="cols" style={{ height: height + 26 }}>
            {rows.map((r, i) => (
                <div className="col" key={`${r.label}-${i}`} title={r.title || `${r.label}: ${r.value}`}>
                    <span className="col-bar" style={{ height: `${Math.max((r.value / max) * height, r.value ? 4 : 2)}px` }} />
                    <span className="col-label">{i % step === 0 ? r.label : ''}</span>
                </div>
            ))}
        </div>
    );
}
