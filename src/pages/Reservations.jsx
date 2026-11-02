import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, formatDateTime, toInputValue, toIso } from '../api';
import { useAuth } from '../auth';

export default function Reservations() {
    const { isAdmin } = useAuth();
    const [reservations, setReservations] = useState(null);
    const [spaces, setSpaces] = useState([]);
    const [error, setError] = useState('');
    const [editing, setEditing] = useState(null); //{ id, reserveDate, coworkingSpace }

    const load = () =>
        api('/reservations')
            .then((r) => setReservations(r.data))
            .catch((e) => setError(e.message));

    useEffect(() => {
        load();
        api('/coworkingspaces', { params: { limit: 100 } }).then((r) => setSpaces(r.data)).catch(() => {});
    }, []);

    const startEdit = (r) =>
        setEditing({ id: r._id, reserveDate: toInputValue(r.reserveDate), coworkingSpace: r.coworkingSpace?._id || '' });

    const saveEdit = async () => {
        setError('');
        try {
            await api(`/reservations/${editing.id}`, {
                method: 'PUT',
                body: { reserveDate: toIso(editing.reserveDate), coworkingSpace: editing.coworkingSpace }
            });
            setEditing(null);
            await load();
        } catch (e) {
            setError(e.message);
        }
    };

    const remove = async (r) => {
        if (!window.confirm('Delete this reservation?')) return;
        setError('');
        try {
            await api(`/reservations/${r._id}`, { method: 'DELETE' });
            await load();
        } catch (e) {
            setError(e.message);
        }
    };

    if (!reservations && !error) return <p>Loading...</p>;

    const sorted = [...(reservations || [])].sort((a, b) => new Date(a.reserveDate) - new Date(b.reserveDate));

    return (
        <>
            <h1>{isAdmin ? 'All reservations' : 'My reservations'}</h1>
            {error && <p className="error">{error}</p>}
            {reservations && sorted.length === 0 && (
                <p className="muted">No reservations yet. <Link to="/">Browse spaces</Link> to make one.</p>
            )}
            {sorted.length > 0 && (
                <div className="table-wrap">
                    <table>
                        <thead>
                            <tr>
                                <th>Co-working space</th>
                                <th>Date and time</th>
                                {isAdmin && <th>User</th>}
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {sorted.map((r) =>
                                editing?.id === r._id ? (
                                    <tr key={r._id}>
                                        <td>
                                            <select value={editing.coworkingSpace} onChange={(e) => setEditing({ ...editing, coworkingSpace: e.target.value })}>
                                                {spaces.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
                                            </select>
                                        </td>
                                        <td>
                                            <input type="datetime-local" value={editing.reserveDate} onChange={(e) => setEditing({ ...editing, reserveDate: e.target.value })} />
                                        </td>
                                        {isAdmin && <td className="muted">{String(r.user).slice(-6)}</td>}
                                        <td>
                                            <div className="actions">
                                                <button className="btn small" onClick={saveEdit}>Save</button>
                                                <button className="btn small" onClick={() => setEditing(null)}>Cancel</button>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    <tr key={r._id}>
                                        <td>{r.coworkingSpace ? <Link to={`/spaces/${r.coworkingSpace._id}`}>{r.coworkingSpace.name}</Link> : <span className="muted">(removed)</span>}</td>
                                        <td>{formatDateTime(r.reserveDate)}</td>
                                        {isAdmin && <td className="muted">{String(r.user).slice(-6)}</td>}
                                        <td>
                                            <div className="actions">
                                                <button className="btn small" onClick={() => startEdit(r)}>Edit</button>
                                                <button className="btn small" onClick={() => remove(r)}>Delete</button>
                                            </div>
                                        </td>
                                    </tr>
                                )
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </>
    );
}
