import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth';

export default function Register() {
    const { register } = useAuth();
    const navigate = useNavigate();

    const [form, setForm] = useState({ name: '', tel: '', email: '', password: '' });
    const [error, setError] = useState('');
    const [busy, setBusy] = useState(false);

    const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setBusy(true);
        try {
            await register(form);
            navigate('/', { replace: true });
        } catch (err) {
            //The backend answers 400 without details for invalid data
            setError(err.status === 400
                ? 'Registration failed. Check that the email is valid and not already used, the phone number has 9-15 digits and the password has at least 6 characters.'
                : err.message);
            setBusy(false);
        }
    };

    return (
        <>
            <h1>Register</h1>
            <form onSubmit={handleSubmit}>
                <label>
                    Name
                    <input required value={form.name} onChange={set('name')} />
                </label>
                <label>
                    Telephone number
                    <input required type="tel" value={form.tel} onChange={set('tel')} />
                </label>
                <label>
                    Email
                    <input type="email" required value={form.email} onChange={set('email')} />
                </label>
                <label>
                    Password (at least 6 characters)
                    <input type="password" required minLength={6} value={form.password} onChange={set('password')} />
                </label>
                {error && <p className="error">{error}</p>}
                <div className="actions">
                    <button className="btn" disabled={busy}>{busy ? 'Registering...' : 'Register'}</button>
                </div>
                <p className="muted">Already registered? <Link to="/login">Login</Link></p>
            </form>
        </>
    );
}
