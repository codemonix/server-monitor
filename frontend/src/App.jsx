import { Routes, Route, Navigate } from "react-router-dom";
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx'

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
    // console.log("RequireAuth");
    let token = null;
    // console.log("token null:", token);
    token = localStorage.getItem('srm.token');
    // console.log("token:", token);
    // console.log("type of token:", typeof token);
    if (!token) {
        console.log("User is not authenticated");
        return <Navigate to="/login" replace />;
    }
    return children;
}