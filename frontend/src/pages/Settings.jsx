
import { useState } from "react";
import { Box, Typography, Tabs, Tab, Paper, Container } from "@mui/material";
import ProfileSettings from "../components/ProfileSettings.jsx";
import SystemSettings from "../components/SystemSettings.jsx";
import UserSettings from "../components/UserSettings.jsx";
import { useAuth } from "../context/AuthContext.jsx";

export default function Settings() {
  const [tab, setTab] = useState(0);
  const { user } = useAuth();

  const appVersion = import.meta.env.VITE_APP_VERSION || 'Development Build';


  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }} >
      <Paper square sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', pr: 2 }} >
        <Tabs value={tab} onChange={(_, v) => setTab(v)} indicatorColor="primary" textColor="primary" >
          <Tab label="Profile" />
          {user?.role === 'admin' && <Tab label="System & Agents" />}
          {user?.role === 'admin' && <Tab label="Users" />}
        </Tabs>
        <Box  >
          <Typography variant="caption" color="textSecondary" >{appVersion}</Typography>
        </Box>
      </Paper>

      <Box role="tabpanel" hidden={tab !== 0} >
        {tab === 0 && <ProfileSettings />}
      </Box>
      <Box role="tabpanel" hidden={tab !== 1} >
        {tab === 1 && user?.role === 'admin' && <SystemSettings />}
      </Box>
      <Box role="tabpanel" hidden={tab !== 2} >
        {tab === 2 && user?.role === 'admin' && <UserSettings />}
      </Box>
    </Container>
  )
}