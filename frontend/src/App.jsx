import { Routes, Route } from "react-router-dom";
import AppLayout from "./components/layout/AppLayout.jsx";
import ProtectedRoutes from "./components/auth/ProtectedRoutes.jsx";
import LoginPage from "./pages/Login.jsx";
import Logout from "./pages/Logout.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import ServersMertricsPage from "./pages/ServersMetricsPage.jsx";
import Settings from "./pages/Settings.jsx";
import AgentsPage from "./pages/AgentsPage.jsx";

function App() {
  return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/logout" element={<Logout />} />
        <Route element={<ProtectedRoutes />}>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/servers" element={<ServersMertricsPage />} />
            <Route path="/agents" element={<AgentsPage />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
        </Route>
      </Routes>
  );
}

export default App;
