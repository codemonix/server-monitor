import { Routes, Route } from "react-router-dom";
import AppLayout from "./components/layout/AppLayout.js";
import ProtectedRoutes from "./components/auth/ProtectedRoutes.js";
import LoginPage from "./pages/Login.js";
import Setup from "./pages/Setup.js";
import Logout from "./pages/Logout.js";
import Dashboard from "./pages/Dashboard.js";
import ServersMertricsPage from "./pages/ServersMetricsPage.js";
import Settings from "./pages/Settings.js";
import AgentsPage from "./pages/AgentsPage.js";

function App() {
  return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/setup" element={<Setup />} />
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
