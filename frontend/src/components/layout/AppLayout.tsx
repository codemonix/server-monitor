import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Box } from "@mui/material";
import TopBar from "./TopBar";
import Sidebar from "./Sidebar";

const DRAWER_WIDTH = 260;

export default function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <TopBar onMenuClick={() => setMobileOpen(true)} drawerWidth={DRAWER_WIDTH} />
      
      <Sidebar 
        mobileOpen={mobileOpen} 
        onClose={() => setMobileOpen(false)} 
        drawerWidth={DRAWER_WIDTH} 
      />
      
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 2,
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` }, // Changed from sm to md
          mt: 8, 
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}