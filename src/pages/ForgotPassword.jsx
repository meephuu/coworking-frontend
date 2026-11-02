import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [busy, setBusy] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setBusy(true);
        try {
            const r = await api('/auth/forgotpassword', { method: 'POST', body: { email } });
            setMessage(r.message);
        } catch (err) {
            setError(err.message);
        }
        setBusy(false);
    };

    return (
        <>
            <h1>Forgot password</h1>
            <form onSubmit={handleSubmit}>
                <p className="muted">Enter your registered email. We will send a link that works once and expires in 15 minutes.</p>
                <label>
                    Email
                    <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
                </label>
                {error && <p className="error">{error}</p>}
                {message && <p className="notice">{message}</p>}
                <div className="actions">
                    <button className="btn" disabled={busy}>{busy ? 'Sending...' : 'Send reset link'}</button>
                    <Link to="/login">Back to login</Link>
                </div>
            </form>
        </>
    );
}
