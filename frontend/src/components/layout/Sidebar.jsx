import { Drawer, Box, Divider, Button, Typography } from "@mui/material";
import LogoutIcon from '@mui/icons-material/Logout';
import SidebarNav from "./SidebarNav";
import { useAuth } from "../../context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";

export default function Sidebar({ mobileOpen, onClose, drawerWidth }) {
  const { user } = useAuth();
  const nav = useNavigate();

  const drawerContent = (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <Box sx={{ height: 64, display: 'flex', alignItems: 'center', px: 3 }}>
          <Typography variant="h6" fontWeight="800" color="primary" letterSpacing={1}>
              SRM
          </Typography>
          <Typography variant="h6" fontWeight="400" sx={{ ml: 1, color: 'text.secondary' }}>
              Console
          </Typography>
      </Box>
      <Divider />
      
      <Box sx={{ flexGrow: 1, py: 2 }}>
          <SidebarNav />
      </Box>
      
      <Divider />
      
      <Box sx={{ p: 2 }}>
        {user && (
          <Button
            variant="outlined"
            color="inherit"
            fullWidth
            startIcon={<LogoutIcon />}
            onClick={() => nav('/logout', { replace: true })}
            sx={{
                justifyContent: 'flex-start',
                color: 'text.secondary',
                borderColor: 'divider',
                '&:hover': {
                    borderColor: 'text.primary',
                    color: 'text.primary',
                    bgcolor: 'action.hover'
                }
            }}
          >
            Logout
          </Button>
        )}
      </Box>
    </Box>
  );

  return (
    <Box component="nav" sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}>
      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: "block", md: "none" }, // Changed from sm to md
          "& .MuiDrawer-paper": { boxSizing: 'border-box', width: drawerWidth },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Desktop Drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: "none", md: "block" }, // Changed from sm to md
          "& .MuiDrawer-paper": { 
            boxSizing: 'border-box', 
            width: drawerWidth, 
            borderRight: '1px solid', 
            borderColor: 'divider',
            backgroundImage: 'none' 
          },
        }}
        open
      >
        {drawerContent}
      </Drawer>
    </Box>
  );
}