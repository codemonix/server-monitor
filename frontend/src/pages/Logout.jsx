import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Logout () {
    const { logout } = useAuth();
    const nav = useNavigate();

    useEffect(() => {
        logout();
        nav('/login', { replace: true });
    }, [logout, nav]);
    
    return null;
}