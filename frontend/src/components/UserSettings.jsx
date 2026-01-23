import { useState, useEffect, useCallback } from "react";
import { Box, Button, Paper, Typography } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import api from "../services/api.js";
import { useAuth } from "../context/AuthContext.jsx";

import UsersGrid from "./UsersGrid.jsx";
import CreateUserDialog from "./CreateUserDialog.jsx";
import EditUserRoleDialog from "./EditUserRoleDialog.jsx";
import ResetPasswordDialog from "./ResetPasswordDialog.jsx";



export default function UserSettings () {
    const { user: currentUser } = useAuth();
    const [ users, setUsers ] = useState([]);
    const [ loading, setLoading ] = useState(false);
    
    // Dialog state
    const [ isCreateOpen, setCreateOpen ] = useState(false);
    const [ editRoleTarget, setEditRoleTarget ] = useState(null);
    const [ resetTarget, setResetTarget ] = useState(null);

    useEffect(() => { fetchUsers();},[]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/users');
            console.log("UserSettings.jsx -> fetchUsers -> data:", data);
            setUsers(data);
        } catch (error) {
            console.error("Failed to fetch users:", error.message);
        } finally {
            setLoading(false);
        }
    }

    const handleDelete = useCallback( async (id) => {
        if (!window.confirm("Are you sure you want to delete this user?")) return;
        try {
            await api.delete(`/users/${id}`);
            setUsers(prev => prev.filter(user => user._id !== id));
        } catch (error) {
            alert(error.response?.data?.error || "Failed to delete user.");
        }
    }, []);

    const handleEditRole = useCallback((user) => setEditRoleTarget(user), []);
    const handleResetPassword = useCallback((user) => setResetTarget(user), []);

    
    console.log("UserSettings.jsx -> users:", users);


    return (
        <Paper sx={{ p: 2, height: 600, width: '100%' }}>
            {/* Header */}
            <Box display="flex" justifyContent="space-between" mb={2}>
                <Typography variant="h6">Team Management</Typography>
                <Button variant="contained" startIcon={<PersonAddIcon />} onClick={() => setCreateOpen(true)}>
                    Add User
                </Button>
            </Box>

            {/* The Grid */}
            <Box sx={{ height: 'calc(100% - 60px)' }}>
                <UsersGrid 
                    users={users}
                    loading={loading}
                    currentUserId={currentUser._id}
                    onDelete={handleDelete}
                    onEditRole={handleEditRole}
                    onResetPassword={handleResetPassword}
                />
            </Box>
            
            
            <CreateUserDialog 
                open={isCreateOpen} 
                onClose={() => setCreateOpen(false)}
                onSuccess={fetchUsers} 
            />

            {editRoleTarget && (
                <EditUserRoleDialog
                    open={Boolean(editRoleTarget)}
                    user={editRoleTarget}
                    onClose={() => setEditRoleTarget(null)}
                    onSuccess={fetchUsers}
                />
            )}

            {resetTarget && (
                <ResetPasswordDialog
                    open={Boolean(resetTarget)}
                    user={resetTarget}
                    onClose={() => setResetTarget(null)}
                />
            )}
        </Paper>
    )

}
