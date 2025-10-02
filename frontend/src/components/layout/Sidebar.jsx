import { Drawer, Box, Divider, Button } from "@mui/material";
import SidebarNav from "./SidebarNav";
import { useAuth } from "../../context/AuthContext.jsx";

const drawerWidth = 240;

export default function Sidebar({ mobileOpen, onClose }) {
  const { user, logout } = useAuth();

  const content = (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <SidebarNav />
      <Divider />
      <Box sx={{ mt: "auto", p: 2 }}>
        {user && (
          <Button
            variant="outlined"
            color="error"
            fullWidth
            onClick={logout}
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
