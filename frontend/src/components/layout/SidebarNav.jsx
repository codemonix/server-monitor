import { List, ListItem, ListItemButton, ListItemIcon, ListItemText } from "@mui/material";
import { Link, useLocation } from "react-router-dom";
import DashboardIcon from '@mui/icons-material/Dashboard';
import StorageIcon from '@mui/icons-material/Storage';
import MemoryIcon from '@mui/icons-material/Memory';
import SettingsIcon from '@mui/icons-material/Settings';

const navItems = [
    { title: 'Dashboard', path: '/', icon: <DashboardIcon /> },
    { title: 'Servers', path: '/servers', icon: <StorageIcon /> },
    { title: 'Agents', path: '/agents', icon: <MemoryIcon /> },
    { title: 'Settings', path: '/settings', icon: <SettingsIcon /> },
];

export default function SidebarNav() {
    const location = useLocation();

    return (
        <List sx={{ px: 2 }}>
            {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                    <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
                        <ListItemButton
                            component={Link}
                            to={item.path}
                            selected={isActive}
                            sx={{
                                borderRadius: 1.5,
                                '&.Mui-selected': {
                                    bgcolor: 'primary.main',
                                    color: 'primary.contrastText',
                                    '&:hover': {
                                        bgcolor: 'primary.dark',
                                    },
                                    '& .MuiListItemIcon-root': {
                                        color: 'inherit',
                                    }
                                },
                            }}
                        >
                            <ListItemIcon sx={{ minWidth: 40, color: isActive ? 'inherit' : 'text.secondary' }}>
                                {item.icon}
                            </ListItemIcon>
                            <ListItemText 
                                primary={item.title} 
                                primaryTypographyProps={{ 
                                    fontWeight: isActive ? 600 : 500,
                                    fontSize: '0.875rem'
                                }} 
                            />
                        </ListItemButton>
                    </ListItem>
                );
            })}
        </List>
    );
}