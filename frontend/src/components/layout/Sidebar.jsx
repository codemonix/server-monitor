import { Drawer, Box, Divider, Button, Toolbar } from "@mui/material";
import SidebarNav from "./SidebarNav";
import { useAuth } from "../../context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";

const drawerWidth = 220;

export default function Sidebar({ mobileOpen, onClose }) {
  const { user } = useAuth();
  const nav = useNavigate();

  const buttonStyle = { borderRadius: '4px', color: '#fff', bgcolor: 'rgba(94, 76, 76, 1)', '&:hover': { bgcolor: 'rgba(133, 19, 19, 1)' }, mb: "5px" };
  const content = (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%", bgcolor: 'grey.500'  }}>
      <Toolbar />
      <SidebarNav />
      <Divider />
      <Box sx={{ mt: "auto" }}>
        {user && (
          <Button
            variant="outlined"
            // color="error"
            fullWidth
            onClick={() => nav('/logout', { replace: true })}
            sx={ buttonStyle }
          >
            Logout
          </Button>
        )}
      </Box>
    </Box>
  );

  return (
    <>
      {/* Mobile */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: "block", sm: "none" },
          "& .MuiDrawer-paper": { width: drawerWidth },
        }}
      >
        {content}
      </Drawer>

      {/* Desktop */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: "none", sm: "block" },
          "& .MuiDrawer-paper": { width: drawerWidth, boxSizing: "border-box" },
        }}
        open
      >
        {content}
      </Drawer>
    </>
  );
}
