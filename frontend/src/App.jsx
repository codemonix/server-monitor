import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppLayout from "./components/layout/AppLayout.jsx";
import ProtectedRoutes from "./components/auth/ProtectedRoutes.jsx";
import LoginPage from "./pages/Login.jsx";
import Logout from "./pages/Logout.jsx";
import Dashboard from "./pages/Dashboard";
import Servers from "./pages/Servers";
import Agents from "./pages/Agents";
import Settings from "./pages/Settings";

function App() {
  return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<ProtectedRoutes />}>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/servers" element={<Servers />} />
            <Route path="/agents" element={<Agents />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/logout" element={<Logout />} />
          </Route>
        </Route>
      </Routes>
  );
}

export default App;
