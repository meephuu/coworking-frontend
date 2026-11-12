const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';
const TOKEN_KEY = 'token';

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (token) => {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
};

//Calls the backend; throws an Error whose message is the backend's message
export async function api(path, { method = 'GET', body, params } = {}) {
    const headers = {};
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
    if (body) headers['Content-Type'] = 'application/json';

    let url = BASE + path;
    if (params) {
        const qs = new URLSearchParams(Object.entries(params).filter(([, v]) => v !== '' && v != null));
        if (qs.toString()) url += `?${qs}`;
    }

    let res;
    try {
        res = await fetch(url, { method, headers, body: body ? JSON.stringify(body) : undefined });
    } catch {
        throw new Error('Cannot reach the server. Is the backend running?');
    }

    const text = await res.text();
    let data = {};
    try {
        data = text ? JSON.parse(text) : {};
    } catch {
        data = { message: text };
    }

    if (!res.ok) {
        const err = new Error(data.message || data.msg || `Request failed (${res.status})`);
        err.status = res.status;
        throw err;
    }
    return data;
}

//Date helpers: the backend stores ISO dates, <input type="datetime-local"> uses local "YYYY-MM-DDTHH:mm"
export const toInputValue = (iso) => {
    const d = new Date(iso);
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};
export const toIso = (inputValue) => new Date(inputValue).toISOString();
export const formatDateTime = (iso) =>
    new Date(iso).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' });

//A moment as a YYYY-MM-DD day in Thai time: the backend counts rooms per Thai day
export const thaiDay = (value = new Date()) =>
    new Date(value).toLocaleDateString('en-CA', { timeZone: 'Asia/Bangkok' });
