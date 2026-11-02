import { createContext, useContext, useEffect, useState } from 'react';
import { api, getToken, setToken } from './api';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(!!getToken());

    //Restore the session from a saved token
    useEffect(() => {
        if (!getToken()) return;
        api('/auth/me')
            .then((r) => setUser(r.data))
            .catch(() => setToken(null))
            .finally(() => setLoading(false));
    }, []);

    const startSession = async (token) => {
        setToken(token);
        const r = await api('/auth/me');
        setUser(r.data);
    };

    const login = async (email, password) => {
        const r = await api('/auth/login', { method: 'POST', body: { email, password } });
        await startSession(r.token);
    };

    const register = async (fields) => {
        const r = await api('/auth/register', { method: 'POST', body: fields });
        await startSession(r.token);
    };

    const logout = async () => {
        try {
            await api('/auth/logout');
        } catch {
            //Token is cleared locally either way
        }
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout, isAdmin: user?.role === 'admin' }}>
            {children}
        </AuthContext.Provider>
    );
}
