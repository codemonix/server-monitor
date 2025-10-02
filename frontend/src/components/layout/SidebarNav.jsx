import { List, ListItemButton, ListItemText } from "@mui/material";
import { Link } from "react-router-dom";

export default function SidebarNav() {
  return (
    <List>
      <ListItemButton component={Link} to="/dashboard">
        <ListItemText primary="Dashboard" />
      </ListItemButton>
      <ListItemButton component={Link} to="/servers">
        <ListItemText primary="Servers" />
      </ListItemButton>
      <ListItemButton component={Link} to="/agents">
        <ListItemText primary="Agents" />
      </ListItemButton>
      <ListItemButton component={Link} to="/settings">
        <ListItemText primary="Settings" />
      </ListItemButton>
    </List>
  );
}
