import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api';

export default function ResetPassword() {
    const { token } = useParams();
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [error, setError] = useState('');
    const [done, setDone] = useState(false);
    const [busy, setBusy] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (password !== confirm) {
            setError('The two passwords do not match.');
            return;
        }
        setBusy(true);
        try {
            await api(`/auth/resetpassword/${token}`, { method: 'PUT', body: { password } });
            setDone(true);
        } catch (err) {
            setError(err.message);
            setBusy(false);
        }
    };

    if (done) {
        return (
            <>
                <h1>Password reset</h1>
                <p className="notice">Your password has been changed. <Link to="/login">Log in</Link> with the new password.</p>
            </>
        );
    }

    return (
        <>
            <h1>Set a new password</h1>
            <form onSubmit={handleSubmit}>
                <label>
                    New password (at least 6 characters)
                    <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} />
                </label>
                <label>
                    Confirm new password
                    <input type="password" required minLength={6} value={confirm} onChange={(e) => setConfirm(e.target.value)} />
                </label>
                {error && <p className="error">{error}</p>}
                <div className="actions">
                    <button className="btn" disabled={busy}>{busy ? 'Saving...' : 'Reset password'}</button>
                    <Link to="/forgotpassword">Request a new link</Link>
                </div>
            </form>
        </>
    );
}
