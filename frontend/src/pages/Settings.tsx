
import { useState } from "react";
import { Box, Typography, Tabs, Tab, Paper, Container } from "@mui/material";
import ProfileSettings from "../components/ProfileSettings.js";
import SystemSettings from "../components/SystemSettings.js";
import UserSettings from "../components/UserSettings.js";
import SystemLogsSettings from "../components/SystemLogsSettings.js";
import { useAuth } from "../context/AuthContext.js";

export default function Settings() {
  const [tab, setTab] = useState(0);
  const { user } = useAuth();

  const appVersion = import.meta.env.VITE_APP_VERSION || 'Development Build';


  return (
    <Container maxWidth="lg" disableGutters >
      <Paper square sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', pr: 2 }} >
        <Tabs value={tab} onChange={(_, v) => setTab(v)} indicatorColor="primary" textColor="primary" >
          <Tab label="Profile" />
          {user?.role === 'admin' && <Tab label="System & Agents" />}
          {user?.role === 'admin' && <Tab label="System Logs" />}
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
        {tab === 2 && user?.role === 'admin' && <SystemLogsSettings />}
      </Box>
      <Box role="tabpanel" hidden={tab !== 3} >
        {tab === 3 && user?.role === 'admin' && <UserSettings />}
      </Box>
    </Container>
  )
}