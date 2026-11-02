import { useEffect, useState } from 'react';
import { api } from '../api';

const empty = { name: '', address: '', tel: '', openTime: '08:00', closeTime: '22:00' };

export default function AdminSpaces() {
    const [spaces, setSpaces] = useState(null);
    const [form, setForm] = useState(empty);
    const [editingId, setEditingId] = useState(null);
    const [error, setError] = useState('');
    const [busy, setBusy] = useState(false);

    const load = () =>
        api('/coworkingspaces', { params: { limit: 100 } })
            .then((r) => setSpaces(r.data))
            .catch((e) => setError(e.message));

    useEffect(() => { load(); }, []);

    const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

    const startEdit = (s) => {
        setEditingId(s._id);
        setForm({ name: s.name, address: s.address, tel: s.tel, openTime: s.openTime, closeTime: s.closeTime });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const reset = () => {
        setEditingId(null);
        setForm(empty);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setBusy(true);
        try {
            if (editingId) await api(`/coworkingspaces/${editingId}`, { method: 'PUT', body: form });
            else await api('/coworkingspaces', { method: 'POST', body: form });
            reset();
            await load();
        } catch (err) {
            //The backend answers 400 without details for invalid data
            setError(err.status === 400 ? 'Invalid data. The name must be unique and times must be HH:mm.' : err.message);
        }
        setBusy(false);
    };

    const remove = async (s) => {
        if (!window.confirm(`Delete "${s.name}" and all of its reservations?`)) return;
        setError('');
        try {
            await api(`/coworkingspaces/${s._id}`, { method: 'DELETE' });
            if (editingId === s._id) reset();
            await load();
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <>
            <h1>Manage co-working spaces</h1>

            <form onSubmit={handleSubmit}>
                <h2 style={{ marginTop: 0 }}>{editingId ? 'Edit space' : 'Add a space'}</h2>
                <label>Name<input required maxLength={50} value={form.name} onChange={set('name')} /></label>
                <label>Address<input required value={form.address} onChange={set('address')} /></label>
                <label>Telephone number<input required value={form.tel} onChange={set('tel')} /></label>
                <label>Open time<input required type="time" value={form.openTime} onChange={set('openTime')} /></label>
                <label>Close time<input required type="time" value={form.closeTime} onChange={set('closeTime')} /></label>
                {error && <p className="error">{error}</p>}
                <div className="actions">
                    <button className="btn" disabled={busy}>{editingId ? 'Save changes' : 'Add space'}</button>
                    {editingId && <button type="button" className="btn" onClick={reset}>Cancel</button>}
                </div>
            </form>

            <h2>All spaces</h2>
            {!spaces && !error && <p>Loading...</p>}
            {spaces && spaces.length === 0 && <p className="muted">No co-working spaces yet.</p>}
            {spaces && spaces.length > 0 && (
                <div className="table-wrap">
                    <table>
                        <thead>
                            <tr><th>Name</th><th>Address</th><th>Tel</th><th>Open - close</th><th></th></tr>
                        </thead>
                        <tbody>
                            {spaces.map((s) => (
                                <tr key={s._id}>
                                    <td>{s.name}</td>
                                    <td>{s.address}</td>
                                    <td>{s.tel}</td>
                                    <td>{s.openTime} - {s.closeTime}</td>
                                    <td>
                                        <div className="actions">
                                            <button className="btn small" onClick={() => startEdit(s)}>Edit</button>
                                            <button className="btn small" onClick={() => remove(s)}>Delete</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </>
    );
}
