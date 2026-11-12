import { Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import ProtectedRoute from './components/ProtectedRoute';
import Spaces from './pages/Spaces';
import SpaceDetail from './pages/SpaceDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Reservations from './pages/Reservations';
import AdminSpaces from './pages/AdminSpaces';
import AdminDashboard from './pages/AdminDashboard';

export default function App() {
    return (
        <div className="shell">
            <Header />
            <main className="page">
                <Routes>
                    <Route path="/" element={<Spaces />} />
                    <Route path="/spaces/:id" element={<SpaceDetail />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/forgotpassword" element={<ForgotPassword />} />
                    <Route path="/resetpassword/:token" element={<ResetPassword />} />
                    <Route path="/reservations" element={<ProtectedRoute><Reservations /></ProtectedRoute>} />
                    <Route path="/admin/spaces" element={<ProtectedRoute admin><AdminSpaces /></ProtectedRoute>} />
                    <Route path="/admin" element={<ProtectedRoute admin><AdminDashboard /></ProtectedRoute>} />
                    <Route path="/admin/stats" element={<Navigate to="/admin" replace />} />
                    <Route path="*" element={<p>Page not found.</p>} />
                </Routes>
            </main>
        </div>
    );
}
