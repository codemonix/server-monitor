import { Navigate, useLocation } from "react-router-dom";
import { logger } from "../utils/log.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function RequireAuth({ children }) {
    const { user, loading } = useAuth();
    console.log("log -> RequireAuth - user:", user);

    logger.debug("RequireAuth - user:", !!user);
    const location = useLocation();
    if (loading) {
        return <div>Loading...</div>;
    }

    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }
    return children;
}