import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth';

//Line-art coffee cup, as in the design
function Logo() {
    return (
        <svg width="24" height="32" viewBox="0 0 24 32" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" aria-hidden="true">
            <path d="M3 3h18v4H3z" />
            <path d="M5 7l1.6 21h10.8L19 7" />
            <path d="M5.6 11h12.8" />
        </svg>
    );
}

export default function Header() {
    const { user, isAdmin, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    return (
        <header className="header">
            <Link to="/" className="brand">
                <Logo />
                <span className="brand-name">Co-working Space Reservation</span>
            </Link>
            <nav className="menu">
                <NavLink to="/" end>Spaces</NavLink>
                {user && <NavLink to="/reservations">{isAdmin ? 'All reservations' : 'My reservations'}</NavLink>}
                {isAdmin && <NavLink to="/admin/spaces">Manage spaces</NavLink>}
                {isAdmin && <NavLink to="/admin/stats">Statistics</NavLink>}
                {user ? (
                    <button type="button" className="link" onClick={handleLogout}>Logout ({user.name})</button>
                ) : (
                    <>
                        <NavLink to="/login">Login</NavLink>
                        <NavLink to="/register">Register</NavLink>
                    </>
                )}
            </nav>
        </header>
    );
}
