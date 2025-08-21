import React, { useState } from "react";
import api, { setAuthToken } from '../services/api.js';
import log from '../utils/log.js';

export default function Login() {
    const [ username, setUsername ] = useState('');
    const [ password, setPassword ] = useState('');
    const [ err, setErr ] = useState('');

    async function onSubmit(e) {
        e.preventDefault();
        setErr('');
        try {
            const { data } = await api.post('/auth/login', { username, password });
            localStorage.setItem(data.token);
            window.location.href = '/';
        } catch ( error ) {
            setErr(error.response?.data?.message || 'Login failed');
            log.error("login failed:", error.message);
        }
    }

    return (
        <div className="main-h-screen grid place-items-center bg-slate-950 text-white" >
            <form onSubmit={onSubmit} className="w-full max-w-sm bg-slate-900 p-6 rounded-xl space-y-4">
                <h1 className="text-2xl font-bold text-center">Login</h1>
                <input className="w-full p-2 rounded bg-slate-800" placeholder="Username" value={username} 
                    onChange={e => setUsername(e.target.value)} />
                <input className="w-full p-2 rounded bg-slate-800" placeholder="Password" type="password" value={password} 
                    onChange={e => setPassword(e.target.value)} />
                {err && <div className="text-red-500 text-sm">{err}</div>}
                <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white p-2 rounded">Sign in</button>
            </form>
        </div>
    )
}