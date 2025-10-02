import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";

export default function ProtectedRoutes() {
  const { user, loading } = useAuth();

  if (loading) return <p>Loading...</p>;
  return user ? <Outlet /> : <Navigate to="/login" />;
}
