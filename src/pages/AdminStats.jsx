import { useEffect, useState } from 'react';
import { api } from '../api';
import BarList from '../components/BarList';

const isoDay = (d) => d.toISOString().slice(0, 10);
const hourLabel = (h) => `${String(h).padStart(2, '0')}:00`;

export default function AdminStats() {
    const [filters, setFilters] = useState({
        from: isoDay(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)),
        to: isoDay(new Date()),
        groupBy: 'day'
    });
    const [data, setData] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const load = async (f = filters) => {
        setError('');
        setLoading(true);
        try {
            const r = await api('/stats/reservations', { params: f });
            setData(r.data);
        } catch (e) {
            setError(e.message);
            setData(null);
        }
        setLoading(false);
    };

    useEffect(() => { load(); }, []);

    const set = (key) => (e) => setFilters({ ...filters, [key]: e.target.value });

    return (
        <>
            <h1>Reservation statistics</h1>

            <form className="filters" onSubmit={(e) => { e.preventDefault(); load(); }}>
                <label>From<input type="date" required value={filters.from} onChange={set('from')} /></label>
                <label>To<input type="date" required value={filters.to} onChange={set('to')} /></label>
                <label>
                    Reservations per
                    <select value={filters.groupBy} onChange={set('groupBy')}>
                        <option value="day">day</option>
                        <option value="month">month</option>
                    </select>
                </label>
                <button className="btn" disabled={loading}>{loading ? 'Loading...' : 'Show'}</button>
            </form>

            {error && <p className="error">{error}</p>}

            {data && (
                <>
                    <div className="summary">
                        <div className="stat"><span className="muted">Total reservations</span><span className="big">{data.totalReservations}</span></div>
                        <div className="stat"><span className="muted">Peak hour</span><span className="big">{data.peakHour == null ? '-' : hourLabel(data.peakHour)}</span></div>
                        <div className="stat"><span className="muted">Peak day</span><span className="big">{data.peakDay || '-'}</span></div>
                        <div className="stat"><span className="muted">Days in range</span><span className="big">{data.range.totalDays}</span></div>
                    </div>

                    <h2>Most-booked spaces</h2>
                    {data.mostBookedSpaces.length === 0
                        ? <p className="muted">No reservations in this range.</p>
                        : <BarList rows={data.mostBookedSpaces.map((m) => ({ label: m.space.name, value: m.reservations }))} />}

                    <h2>Utilisation rate per space</h2>
                    <p className="muted">Share of days in the range on which the space had at least one reservation.</p>
                    <div className="table-wrap">
                        <table>
                            <thead><tr><th>Space</th><th>Reservations</th><th>Days booked</th><th>Utilisation</th></tr></thead>
                            <tbody>
                                {data.utilisation.map((u) => (
                                    <tr key={u.space._id}>
                                        <td>{u.space.name}</td>
                                        <td>{u.reservations}</td>
                                        <td>{u.bookedDays} / {data.range.totalDays}</td>
                                        <td>{u.utilisationRate}%</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <h2>Peak hours</h2>
                    <BarList rows={data.byHour.map((h) => ({ label: hourLabel(h.hour), value: h.reservations }))} />

                    <h2>Peak days of the week</h2>
                    <BarList rows={data.byDayOfWeek.map((d) => ({ label: d.day, value: d.reservations }))} />

                    <h2>Reservations per {data.reservationsPer.groupBy}</h2>
                    {data.reservationsPer.data.length === 0
                        ? <p className="muted">No reservations in this range.</p>
                        : <BarList rows={data.reservationsPer.data.map((p) => ({ label: p.period, value: p.reservations }))} />}
                </>
            )}
        </>
    );
}
