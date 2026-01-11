import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Logout () {
    const { logout } = useAuth();
    const nav = useNavigate();
    const [ message, setMessage ] = useState("Logging out...")

    useEffect(() => {
        logout();
        setMessage("You have beed logged out successfully.")
        
        const timer = setTimeout(() => {
            nav('/login', { replace: true });
        }, 2000);

        return () => clearTimeout(timer);

    }, [logout, nav]);
    
    return (
        <div style={{ textAlign: "center", marginTop: "2rem" }}>
            <h2>{message}</h2>
        </div>
    );
}
