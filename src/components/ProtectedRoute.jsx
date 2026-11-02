import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../auth';

export default function ProtectedRoute({ admin = false, children }) {
    const { user, loading, isAdmin } = useAuth();
    const location = useLocation();

    if (loading) return <p>Loading...</p>;
    if (!user) return <Navigate to="/login" state={{ from: location.pathname }} replace />;
    if (admin && !isAdmin) return <p className="error">This page is for admins only.</p>;

    return children;
}
