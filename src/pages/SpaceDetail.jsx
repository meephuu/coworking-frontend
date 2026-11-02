import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api, toIso } from '../api';
import { useAuth } from '../auth';

export default function SpaceDetail() {
    const { id } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [space, setSpace] = useState(null);
    const [error, setError] = useState('');
    const [reserveDate, setReserveDate] = useState('');
    const [formError, setFormError] = useState('');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        api(`/coworkingspaces/${id}`)
            .then((r) => setSpace(r.data))
            .catch((e) => setError(e.status === 400 || e.status === 404 ? 'Co-working space not found.' : e.message));
    }, [id]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError('');
        setSaving(true);
        try {
            await api(`/coworkingspaces/${id}/reservations`, { method: 'POST', body: { reserveDate: toIso(reserveDate) } });
            navigate('/reservations');
        } catch (err) {
            setFormError(err.message);
            setSaving(false);
        }
    };

    if (error) return <p className="error">{error}</p>;
    if (!space) return <p>Loading...</p>;

    return (
        <>
            <h1>{space.name}</h1>
            <dl className="details">
                <dt>Address</dt><dd>{space.address}</dd>
                <dt>Telephone</dt><dd>{space.tel}</dd>
                <dt>Open - close</dt><dd>{space.openTime} - {space.closeTime}</dd>
            </dl>

            <h2>Reserve a room</h2>
            {user ? (
                <form onSubmit={handleSubmit}>
                    <label>
                        Date and time
                        <input type="datetime-local" required value={reserveDate} onChange={(e) => setReserveDate(e.target.value)} />
                    </label>
                    <p className="muted">Open {space.openTime} - {space.closeTime}. You can have up to 3 reservations.</p>
                    {formError && <p className="error">{formError}</p>}
                    <div className="actions">
                        <button className="btn" disabled={saving}>{saving ? 'Reserving...' : 'Reserve'}</button>
                        <Link className="btn" to="/">Back</Link>
                    </div>
                </form>
            ) : (
                <p className="notice">
                    Please <Link to="/login" state={{ from: `/spaces/${id}` }}>log in</Link> or <Link to="/register">register</Link> to make a reservation.
                </p>
            )}
        </>
    );
}
