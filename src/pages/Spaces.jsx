import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, thaiDay } from '../api';
import RoomsLeft from '../components/RoomsLeft';

const PAGE_SIZE = 9;
//Centre of Bangkok, so the nearby search works before the browser location is shared
const BANGKOK = { lat: '13.7563', lng: '100.5018' };

export default function Spaces() {
    const [mode, setMode] = useState('all'); //'all' | 'nearby'
    const [date, setDate] = useState(thaiDay());
    const [page, setPage] = useState(1);

    //What the nearby form is editing, and what was actually searched
    const [where, setWhere] = useState({ ...BANGKOK, radius: '10' });
    const [search, setSearch] = useState(null);
    const [locating, setLocating] = useState(false);
    const [locationError, setLocationError] = useState('');

    const [state, setState] = useState({ loading: true });

    useEffect(() => {
        if (mode === 'nearby' && !search) {
            setState({ spaces: [] });
            return;
        }

        let cancelled = false;
        setState({ loading: true });

        const request = mode === 'nearby'
            ? api('/coworkingspaces/nearby', { params: { ...search, date } })
            : api('/coworkingspaces', { params: { page, limit: PAGE_SIZE, date } });

        request
            .then((r) => !cancelled && setState({ spaces: r.data, pagination: r.pagination || {} }))
            .catch((e) => !cancelled && setState({ error: e.message }));
        return () => { cancelled = true; };
    }, [mode, page, date, search]);

    const useMyLocation = () => {
        setLocationError('');
        if (!navigator.geolocation) {
            setLocationError('Your browser does not support location.');
            return;
        }
        setLocating(true);
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const next = { ...where, lat: pos.coords.latitude.toFixed(5), lng: pos.coords.longitude.toFixed(5) };
                setWhere(next);
                setSearch(next);
                setLocating(false);
            },
            () => {
                setLocationError('Could not get your location. Type latitude and longitude instead.');
                setLocating(false);
            }
        );
    };

    const setField = (key) => (e) => setWhere({ ...where, [key]: e.target.value });

    return (
        <>
            <h1>Co-working spaces</h1>

            <div className="filters">
                <div className="actions">
                    <button type="button" className={`btn small ${mode === 'all' ? 'active' : ''}`} onClick={() => { setMode('all'); setPage(1); }}>All spaces</button>
                    <button type="button" className={`btn small ${mode === 'nearby' ? 'active' : ''}`} onClick={() => setMode('nearby')}>Nearby</button>
                </div>
                <label>
                    Rooms free on
                    <input type="date" value={date} min={thaiDay()} onChange={(e) => e.target.value && setDate(e.target.value)} />
                </label>
            </div>

            {mode === 'nearby' && (
                <form className="filters" onSubmit={(e) => { e.preventDefault(); setSearch({ ...where }); }}>
                    <label>Latitude<input required type="number" step="any" value={where.lat} onChange={setField('lat')} /></label>
                    <label>Longitude<input required type="number" step="any" value={where.lng} onChange={setField('lng')} /></label>
                    <label>Radius (km)<input required type="number" step="any" min="0.1" value={where.radius} onChange={setField('radius')} /></label>
                    <button className="btn">Search</button>
                    <button type="button" className="btn" onClick={useMyLocation} disabled={locating}>{locating ? 'Locating...' : 'Use my location'}</button>
                </form>
            )}
            {locationError && <p className="error">{locationError}</p>}

            {state.loading && <p>Loading...</p>}
            {state.error && <p className="error">{state.error}</p>}

            {state.spaces && (
                <>
                    {mode === 'nearby' && search && <p className="muted">{state.spaces.length} space(s) within {search.radius} km, nearest first.</p>}
                    {mode === 'nearby' && !search && <p className="muted">Enter a location and press Search, or use your location.</p>}
                    {mode === 'all' && state.spaces.length === 0 && <p className="muted">No co-working spaces yet.</p>}
                    {mode === 'nearby' && search && state.spaces.length === 0 && <p className="muted">No co-working space found in that radius. Try a larger radius.</p>}

                    <div className="grid">
                        {state.spaces.map((s) => (
                            <article className="card" key={s._id}>
                                <h2>{s.name}</h2>
                                {s.distanceKm != null && <span className="tag">{s.distanceKm} km away</span>}
                                <span>{s.address}</span>
                                <span>Tel: {s.tel}</span>
                                <span className="muted">Open {s.openTime} - {s.closeTime}</span>
                                <span className={s.availableRooms === 0 ? 'full' : ''}><RoomsLeft space={s} /></span>
                                <Link className="btn small" to={`/spaces/${s._id}`} state={{ date }}>View / Reserve</Link>
                            </article>
                        ))}
                    </div>

                    {mode === 'all' && (
                        <div className="pager">
                            <button className="btn small" disabled={!state.pagination?.prev} onClick={() => setPage(page - 1)}>Prev</button>
                            <span>Page {page}</span>
                            <button className="btn small" disabled={!state.pagination?.next} onClick={() => setPage(page + 1)}>Next</button>
                        </div>
                    )}
                </>
            )}
        </>
    );
}
