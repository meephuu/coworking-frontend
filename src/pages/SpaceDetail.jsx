import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { api, thaiDay, toInputValue, toIso } from '../api';
import { useAuth } from '../auth';
import RoomsLeft from '../components/RoomsLeft';

export default function SpaceDetail() {
    const { id } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const [space, setSpace] = useState(null);
    const [error, setError] = useState('');
    const [reserveDate, setReserveDate] = useState('');
    const [formError, setFormError] = useState('');
    const [saving, setSaving] = useState(false);

    //Rooms are counted per Thai day: follow the chosen reservation date, else the day picked on the list page
    const day = reserveDate ? thaiDay(reserveDate) : (location.state?.date || thaiDay());

    useEffect(() => {
        let cancelled = false;
        api(`/coworkingspaces/${id}`, { params: { date: day } })
            .then((r) => !cancelled && setSpace(r.data))
            .catch((e) => !cancelled && setError(e.status === 400 || e.status === 404 ? 'Co-working space not found.' : e.message));
        return () => { cancelled = true; };
    }, [id, day]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError('');
        setSaving(true);
        try {
            await api(`/coworkingspaces/${id}/reservations`, { method: 'POST', body: { reserveDate: toIso(reserveDate) } });
            navigate('/reservations');
        } catch (err) {
            //Backend rules: future date, within opening hours, a free room, at most 3 reservations
            setFormError(err.message);
            setSaving(false);
        }
    };

    if (error) return <p className="error">{error}</p>;
    if (!space) return <p>Loading...</p>;

    const full = space.availableRooms === 0;

    return (
        <>
            <h1>{space.name}</h1>
            <dl className="details">
                <dt>Address</dt><dd>{space.address}</dd>
                <dt>Telephone</dt><dd>{space.tel}</dd>
                <dt>Open - close</dt><dd>{space.openTime} - {space.closeTime} (Thai time)</dd>
                <dt>Rooms</dt><dd>{space.totalRooms ?? '-'} in total</dd>
                <dt>Free on {day}</dt><dd className={full ? 'full' : ''}><RoomsLeft space={space} /></dd>
                {space.latitude != null && (
                    <>
                        <dt>Location</dt>
                        <dd>
                            <a href={`https://www.google.com/maps?q=${space.latitude},${space.longitude}`} target="_blank" rel="noreferrer">
                                {space.latitude}, {space.longitude}
                            </a>
                        </dd>
                    </>
                )}
            </dl>

            <h2>Reserve a room</h2>
            {user ? (
                <form onSubmit={handleSubmit}>
                    <label>
                        Date and time
                        <input type="datetime-local" required min={toInputValue(new Date())} value={reserveDate} onChange={(e) => setReserveDate(e.target.value)} />
                    </label>
                    <p className="muted">
                        Choose a future time between {space.openTime} and {space.closeTime}. You can have up to 3 reservations.
                    </p>
                    {full && <p className="error">No rooms are left on {day}. Pick another day.</p>}
                    {formError && <p className="error">{formError}</p>}
                    <div className="actions">
                        <button className="btn" disabled={saving || full}>{saving ? 'Reserving...' : 'Reserve'}</button>
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
