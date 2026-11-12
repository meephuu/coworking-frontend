import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, thaiDay } from '../api';
import BarList from '../components/BarList';
import ColumnChart from '../components/ColumnChart';

const daysAgo = (n) => thaiDay(new Date(Date.now() - n * 24 * 60 * 60 * 1000));
const hourLabel = (h) => `${String(h).padStart(2, '0')}:00`;

export default function AdminDashboard() {
    //Statistics for a date range (GET /stats/reservations)
    const [filters, setFilters] = useState({ from: daysAgo(30), to: thaiDay(), groupBy: 'day' });
    const [stats, setStats] = useState(null);
    const [statsError, setStatsError] = useState('');
    const [statsLoading, setStatsLoading] = useState(false);

    //Rooms free per space on one day (GET /coworkingspaces?date=)
    const [availDate, setAvailDate] = useState(thaiDay());
    const [spaces, setSpaces] = useState(null);
    const [spacesError, setSpacesError] = useState('');

    const loadStats = async (f = filters) => {
        setStatsError('');
        setStatsLoading(true);
        try {
            const r = await api('/stats/reservations', { params: f });
            setStats(r.data);
        } catch (e) {
            setStatsError(e.message);
            setStats(null);
        }
        setStatsLoading(false);
    };

    useEffect(() => { loadStats(); }, []);

    useEffect(() => {
        let cancelled = false;
        setSpacesError('');
        api('/coworkingspaces', { params: { limit: 100, date: availDate } })
            .then((r) => !cancelled && setSpaces(r.data))
            .catch((e) => !cancelled && setSpacesError(e.message));
        return () => { cancelled = true; };
    }, [availDate]);

    const setFilter = (key) => (e) => setFilters({ ...filters, [key]: e.target.value });

    const withRooms = (spaces || []).filter((s) => s.totalRooms != null);
    const totalRooms = withRooms.reduce((sum, s) => sum + s.totalRooms, 0);
    const reservedRooms = withRooms.reduce((sum, s) => sum + s.reservedRooms, 0);

    return (
        <>
            <h1>Admin dashboard</h1>
            <div className="actions">
                <Link className="btn small" to="/admin/spaces">Manage spaces</Link>
                <Link className="btn small" to="/reservations">All reservations</Link>
            </div>

            <h2>Rooms today</h2>
            <label className="inline">
                Day
                <input type="date" value={availDate} onChange={(e) => e.target.value && setAvailDate(e.target.value)} />
            </label>
            {spacesError && <p className="error">{spacesError}</p>}
            {!spaces && !spacesError && <p>Loading...</p>}
            {spaces && (
                <>
                    <div className="summary">
                        <div className="stat"><span className="muted">Co-working spaces</span><span className="big">{spaces.length}</span></div>
                        <div className="stat"><span className="muted">Total rooms</span><span className="big">{totalRooms}</span></div>
                        <div className="stat"><span className="muted">Reserved on {availDate}</span><span className="big">{reservedRooms}</span></div>
                        <div className="stat"><span className="muted">Free on {availDate}</span><span className="big">{totalRooms - reservedRooms}</span></div>
                    </div>
                    {spaces.length > 0 && (
                        <div className="table-wrap">
                            <table>
                                <thead><tr><th>Space</th><th>Occupancy</th><th>Reserved</th><th>Free</th></tr></thead>
                                <tbody>
                                    {spaces.map((s) => {
                                        const pct = s.totalRooms ? (s.reservedRooms / s.totalRooms) * 100 : 0;
                                        return (
                                            <tr key={s._id}>
                                                <td>{s.name}</td>
                                                <td style={{ width: '40%' }}>
                                                    {s.totalRooms == null
                                                        ? <span className="muted">room count not set</span>
                                                        : <span className="bar-track"><span className={`bar-fill ${pct >= 100 ? 'is-full' : ''}`} style={{ width: `${pct}%` }} /></span>}
                                                </td>
                                                <td>{s.reservedRooms} / {s.totalRooms ?? '-'}</td>
                                                <td>{s.availableRooms === 0 ? <strong>Full</strong> : (s.availableRooms ?? '-')}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </>
            )}

            <h2>Reservation statistics</h2>
            <form className="filters" onSubmit={(e) => { e.preventDefault(); loadStats(); }}>
                <label>From<input type="date" required value={filters.from} onChange={setFilter('from')} /></label>
                <label>To<input type="date" required value={filters.to} onChange={setFilter('to')} /></label>
                <label>
                    Reservations per
                    <select value={filters.groupBy} onChange={setFilter('groupBy')}>
                        <option value="day">day</option>
                        <option value="month">month</option>
                    </select>
                </label>
                <button className="btn" disabled={statsLoading}>{statsLoading ? 'Loading...' : 'Show'}</button>
            </form>

            {statsError && <p className="error">{statsError}</p>}

            {stats && (
                <>
                    <div className="summary">
                        <div className="stat"><span className="muted">Reservations in range</span><span className="big">{stats.totalReservations}</span></div>
                        <div className="stat"><span className="muted">Peak hour</span><span className="big">{stats.peakHour == null ? '-' : hourLabel(stats.peakHour)}</span></div>
                        <div className="stat"><span className="muted">Peak day</span><span className="big">{stats.peakDay || '-'}</span></div>
                        <div className="stat"><span className="muted">Days in range</span><span className="big">{stats.range.totalDays}</span></div>
                    </div>

                    <h2>Reservations per {stats.reservationsPer.groupBy}</h2>
                    {stats.reservationsPer.data.length === 0
                        ? <p className="muted">No reservations in this range.</p>
                        : <ColumnChart rows={stats.reservationsPer.data.map((p) => ({
                            label: stats.reservationsPer.groupBy === 'day' ? p.period.slice(5) : p.period,
                            title: `${p.period}: ${p.reservations}`,
                            value: p.reservations
                        }))} />}

                    <h2>Most-booked spaces</h2>
                    {stats.mostBookedSpaces.length === 0
                        ? <p className="muted">No reservations in this range.</p>
                        : <BarList rows={stats.mostBookedSpaces.map((m) => ({ label: m.space.name, value: m.reservations }))} />}

                    <h2>Utilisation rate per space</h2>
                    <p className="muted">Share of days in the range on which the space had at least one reservation.</p>
                    <div className="table-wrap">
                        <table>
                            <thead><tr><th>Space</th><th>Reservations</th><th>Days booked</th><th>Utilisation</th></tr></thead>
                            <tbody>
                                {stats.utilisation.map((u) => (
                                    <tr key={u.space._id}>
                                        <td>{u.space.name}</td>
                                        <td>{u.reservations}</td>
                                        <td>{u.bookedDays} / {stats.range.totalDays}</td>
                                        <td>{u.utilisationRate}%</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <h2>Peak hours</h2>
                    <ColumnChart rows={stats.byHour.map((h) => ({
                        label: String(h.hour).padStart(2, '0'),
                        title: `${hourLabel(h.hour)}: ${h.reservations}`,
                        value: h.reservations
                    }))} />

                    <h2>Peak days of the week</h2>
                    <BarList rows={stats.byDayOfWeek.map((d) => ({ label: d.day, value: d.reservations }))} />
                </>
            )}
        </>
    );
}
