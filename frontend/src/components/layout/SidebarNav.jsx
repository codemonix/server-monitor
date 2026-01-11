import { List, ListItemButton, ListItemText } from "@mui/material";
import { Link } from "react-router-dom";

export default function SidebarNav() {
        // const buttonStyle = { borderRadius: '4px', color: '#fff', '&:hover': { bgcolor: '#' } };

    const buttonStyle = { borderRadius: '4px', color: '#fff', bgcolor: 'grey.600', '&:hover': { bgcolor: '#606b7c' }, m: 1 };
  return (
    <List sx={{ border: '1px solid ', borderColor: 'grey.400' , bgcolor: 'grey.500' }}>
      <ListItemButton sx={buttonStyle} component={Link} to="/">
        <ListItemText primary="Dashboard" />
      </ListItemButton>
      <ListItemButton sx={buttonStyle} component={Link} to="/servers">
        <ListItemText primary="Servers" />
      </ListItemButton>
      <ListItemButton sx={buttonStyle} component={Link} to="/agents">
        <ListItemText primary="Agents" />
      </ListItemButton>
      <ListItemButton sx={buttonStyle} component={Link} to="/settings">
        <ListItemText primary="Settings" />
      </ListItemButton>
    </List>
  );
}
