import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth';

export default function Login() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [busy, setBusy] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setBusy(true);
        try {
            await login(email, password);
            navigate(location.state?.from || '/', { replace: true });
        } catch (err) {
            setError(err.message);
            setBusy(false);
        }
    };

    return (
        <>
            <h1>Login</h1>
            <form onSubmit={handleSubmit}>
                <label>
                    Email
                    <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
                </label>
                <label>
                    Password
                    <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
                </label>
                {error && <p className="error">{error}</p>}
                <div className="actions">
                    <button className="btn" disabled={busy}>{busy ? 'Logging in...' : 'Login'}</button>
                    <Link to="/forgotpassword">Forgot password?</Link>
                </div>
                <p className="muted">No account yet? <Link to="/register">Register</Link></p>
            </form>
        </>
    );
}
