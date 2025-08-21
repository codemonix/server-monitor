import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import Login from './Login.jsx';
import Dashboard from './Dashboard.jsx';
import React from "react";

export default function App(){
    return (
        <Routes >
            <Route path="/login" element={< Login />} ></Route>
            <Route path="/" element={<RequireAuth ><Dashboard /></RequireAuth>} ></Route>
            <Route path="*" element={<Navigate to='/' />}/>
        </Routes>
    )
}

function RequireAuth({ children }) {
    const navigate = useNavigate();
    const token = localStorage.getItem('token');
    React.useEffect(() => { if(!token) navigate('/login')}, [token]);
    return token ? children : null;
}