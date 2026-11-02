import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';

const PAGE_SIZE = 9;

export default function Spaces() {
    const [page, setPage] = useState(1);
    const [state, setState] = useState({ loading: true });

    useEffect(() => {
        let cancelled = false;
        setState({ loading: true });
        api('/coworkingspaces', { params: { page, limit: PAGE_SIZE } })
            .then((r) => !cancelled && setState({ spaces: r.data, pagination: r.pagination }))
            .catch((e) => !cancelled && setState({ error: e.message }));
        return () => { cancelled = true; };
    }, [page]);

    if (state.loading) return <p>Loading...</p>;
    if (state.error) return <p className="error">{state.error}</p>;

    return (
        <>
            <h1>Co-working spaces</h1>
            {state.spaces.length === 0 && <p className="muted">No co-working spaces yet.</p>}
            <div className="grid">
                {state.spaces.map((s) => (
                    <article className="card" key={s._id}>
                        <h2>{s.name}</h2>
                        <span>{s.address}</span>
                        <span>Tel: {s.tel}</span>
                        <span className="muted">Open {s.openTime} - {s.closeTime}</span>
                        <Link className="btn small" to={`/spaces/${s._id}`}>View / Reserve</Link>
                    </article>
                ))}
            </div>
            <div className="pager">
                <button className="btn small" disabled={!state.pagination.prev} onClick={() => setPage(page - 1)}>Prev</button>
                <span>Page {page}</span>
                <button className="btn small" disabled={!state.pagination.next} onClick={() => setPage(page + 1)}>Next</button>
            </div>
        </>
    );
}
