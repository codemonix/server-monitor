import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Button,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import CircularIcon from "@mui/icons-material/Circle";
import { useState } from "react";
import { useSelector } from "react-redux";
import SelectAgentsDialog from "../SelectAgentsDialog.jsx";

export default function TopBar({ onMenuClick }) {
  const [ dialogOpen, setDialogOpen ] = useState(false);

  const { items, hiddenAgentIds } = useSelector(state => state.metrics);
  
  const visisbleAgents = items.filter( a => !hiddenAgentIds.includes(a._id))

  const counts = {
    online: visisbleAgents.filter(a => a.status === 'online').length,
    offline: visisbleAgents.filter(a => a.status === 'offline').length,
    warning: visisbleAgents.filter(a => a.status === 'warning').length,
  };

  return (
    <>
      <AppBar position="fixed" sx={{ zIndex: (t) => t.zIndex.drawer + 1 }}>
        <Toolbar sx={{ bgcolor: '#606b7c', display: "flex", justifyContent: "space-between" }}>

          {/* leftside logo / menu */}
          <Box display='flex' alignItems='center' >
            <IconButton
              color="inherit"
              edge="start"
              onClick={onMenuClick}
              sx={{ mr: 2, display: { sm: "none" } }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" noWrap component="div">
              Server Monitor
            </Typography>
          </Box>

          {/* Right side: indicators & Button */}
          <Box display="flex" flexDirection="row" alignItems="center" gap={3} >
            {/* Status indicators */}
            <Box display="flex" flexDirection="row" alignItems="center" justifyContent="center" gap={2} sx={{ bgcolor: 'rgba(0,0,0,0.2)', px: 2, py: 1, borderRadius: 2 }} >
              <Box display="flex" alignItems="center" gap={0.5} title="Online">
                <CircularIcon sx={{ fontSize: 12, color: '#4caf50' }} />
                <Typography variant="body2" fontWeight="bold" >{counts.online}</Typography>
              </Box>
              <Box display="flex" alignItems="center" gap={0.5} title="Warning" >
                <CircularIcon sx={{ fontSize: 12, color: '#ff9800' }} />
                <Typography variant="body2" fontWeight="bold" >{counts.warning}</Typography>
              </Box>
              <Box display="flex" alignItems="center" gap={0.5} title="Offline" >
                <CircularIcon sx={{ fontSize: 12, color: '#f44336' }} />
                <Typography variant="body2" fontWeight="bold" >{counts.offline}</Typography>
              </Box>
            </Box>
            {/* Select Button */}
            <Button 
              variant="contained"
              size="small"
              onClick={() => setDialogOpen(true)}
              sx={{
                bgcolor: 'rgba(255,255,255,0.15)',
                textTransform: 'none',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.25)' }
              }}
            >
              Select Agents
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      <SelectAgentsDialog open={dialogOpen} onClose={() => setDialogOpen(false)} />

    </>
    
  );
}
