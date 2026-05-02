import { 
  Box, AppBar, Toolbar, Typography, IconButton, Button, Divider 
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import CircularIcon from "@mui/icons-material/Circle";
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import { useState } from "react";
import { useLocation } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "../../redux/hooks.js";
import SelectAgentsDialog from "../SelectAgentsDialog.js";
import { toggleTheme } from "../../redux/slices/settingsSlice.js";

const getPageTitle = (pathname) => {
  if (pathname.startsWith('/agents')) return 'Agents';
  if (pathname.startsWith('/servers')) return 'Server Metrics';
  if (pathname.startsWith('/settings')) return 'Settings';
  return 'Overview';
}

export default function TopBar({ onMenuClick, drawerWidth }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const location = useLocation();
  const dispatch = useAppDispatch();

  const { items, hiddenAgentIds } = useAppSelector((state) => state.metrics);
  const themeMode = useAppSelector((state) => state.settings.themeMode);
  
  const visibleAgents = items.filter(a => !hiddenAgentIds.includes(a._id));
  const currentTitle = getPageTitle(location.pathname);

  const counts = {
    online: visibleAgents.filter(a => a.status === 'online').length,
    offline: visibleAgents.filter(a => a.status === 'offline').length,
    warning: visibleAgents.filter(a => a.status === 'warning').length,
  };

  return (
    <>
      <AppBar 
        position="fixed" 
        elevation={0}
        sx={{ 
            width: { md: `calc(100% - ${drawerWidth}px)` }, // Changed from sm to md
            ml: { md: `${drawerWidth}px` },                 // Changed from sm to md
            bgcolor: 'background.paper',
            borderBottom: '1px solid',
            borderColor: 'divider',
            color: 'text.primary'
        }}
      >
        <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>

          <Box display='flex' alignItems='center'>
            <IconButton
              color="inherit"
              edge="start"
              onClick={onMenuClick}
              sx={{ mr: 2, display: { md: "none" } }} // Changed from sm to md
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" noWrap fontWeight="600">
              {currentTitle}
            </Typography>
          </Box>

          <Box display="flex" flexDirection="row" alignItems="center" gap={2}>
            
            <Box display={{ xs: 'none', md: 'flex' }} gap={1.5}>
              <Box display="flex" alignItems="center" gap={0.5} title="Online Agents">
                <CircularIcon color="success" sx={{ fontSize: 12 }} />
                <Typography variant="body2" fontWeight="bold">{counts.online}</Typography>
              </Box>
              <Box display="flex" alignItems="center" gap={0.5} title="Warning">
                <CircularIcon color="warning" sx={{ fontSize: 12 }} />
                <Typography variant="body2" fontWeight="bold">{counts.warning}</Typography>
              </Box>
              <Box display="flex" alignItems="center" gap={0.5} title="Offline">
                <CircularIcon color="error" sx={{ fontSize: 12 }} />
                <Typography variant="body2" fontWeight="bold">{counts.offline}</Typography>
              </Box>
            </Box>

            <Divider orientation="vertical" flexItem sx={{ my: 1.5, display: { xs: 'none', md: 'block' } }} />

            <Button 
              variant="outlined"
              size="small"
              onClick={() => setDialogOpen(true)}
            >
              Filter Agents
            </Button>

            <IconButton onClick={() => dispatch(toggleTheme())} color="inherit" size="small" edge="end">
                {themeMode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      <SelectAgentsDialog open={dialogOpen} onClose={() => setDialogOpen(false)} />
    </>
  );
}