import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Box } from "@mui/material";
import TopBar from "./TopBar";
import Sidebar from "./Sidebar";

const drawerWidth = 220;

export default function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <Box sx={{ display: "flex" }}>
      <TopBar onMenuClick={() => setMobileOpen(true)} />
      <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          // p: 3,
          mt: 8, // offset for AppBar
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px`},
          // bgcolor: 'grey.300'
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}
