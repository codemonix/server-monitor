import { useState, useEffect } from "react";
import { 
    Box, 
    Button, 
    Paper, 
    Typography, 
    Dialog, 
    DialogTitle, 
    DialogContent, 
    DialogActions, 
    TextField, 
    MenuItem, 
    Alert, 
    IconButton, 
    Chip, 
    Select,  
    FormControl,
    InputLabel
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import DeleteIcon from '@mui/icons-material/Delete';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import EditIcon from '@mui/icons-material/Edit';
import api from "../services/api.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function UserSettings () {
    const { user: currentUser } = useAuth();
    const [ users, setUsers ] = useState([]);
    const [ loading, setLoading ] = useState(false);
    
    // Dialog state
    const [ createOpen, setCreateOpen ] = useState(false);
    const [ formData, setFormData ] = useState({ email: "", password: "", role: "viewer" })
    const [ formError, setFormError ] = useState("");

    const [ editOpen, setEditOpen ] = useState(false);
    const [ editData, setEditData ] = useState({ id: "", email: "", role: "" });

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

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this user?")) return;
        try {
            await api.delete(`/users/${id}`);
            setUsers(users.filter(u => u._id !== id));
        } catch (error) {
            alert(error.response?.data?.error || "Failed to delete user.");
        }
    };

    const handleCreate = async () => {
        setFormError("");
        try {
            await api.post('/users', formData);
            setCreateOpen(false);
            setFormData({ email: "", password: "", role: "viewer" });
            fetchUsers();
        } catch (error) {
            setFormError(error.response?.data?.error || "Failed to create user.");
        }
    };

    const handleUpdateRole = async () => {
        try {
            await api.put(`/users/${editData.id}/role`, { role: editData.role });
            setEditOpen(false);
            fetchUsers();
        } catch (error) {
            alert(error.response?.data?.error || "Failed to update user role.");
        }
    }

    const columns = [
        { field: 'email', headerName: 'Email', flex: 1 },
        { field: 'role', headerName: 'Role', width: 150, 
            renderCell: (p) => <Chip label={p.value} color={ p.value === 'admin' ? 'primary' : 'default' } size="small" />
        },
        { field: 'actions', headerName: 'Actions', width: 150, sortable: false, 
            renderCell: (p) => {
                const isSelf = p.row._id === currentUser._id;
                return (
                    <Box >
                        <IconButton onClick={() => { setEditData({ id: p.row._id, email: p.row.email, role: p.row.role });
                            setEditOpen(true);
                        }} color="primary" disabled={isSelf} size="small" ><EditIcon /></IconButton>
                        {/* <IconButton /> */}
                        <IconButton onClick={() => handleDelete(p.row._id)} color="error" disabled={isSelf} size="small" ><DeleteIcon /></IconButton>
                    </Box>
                );
            }
        }
    ];

    console.log("UserSettings.jsx -> users:", users);


    return (
        <Paper sx={{ p: 2, height: 600, width: '100' }} >
            <Box display="flex" justifyContent="space-between" mb={2} >
                <Typography variant="h6" >Team Management</Typography>
                <Button variant="contained" startIcon={<PersonAddIcon />} onClick={() => setCreateOpen(true)} >Add User</Button>
            </Box>
            <DataGrid rows={users} columns={columns} getRowId={(row) => row._id } loading={loading} disableRowSelectionOnClick />

            {/* Create User Dialog */}
            <Dialog open={createOpen} onClose={() => setCreateOpen(false)} fullWidth maxWidth="sm" >
                <DialogTitle >Add User</DialogTitle>
                <DialogContent >
                    <Box display="flex" flexDirection="column" gap={2} mt={1} >
                        <TextField label="Email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} fullWidth />
                        <TextField label="Password" type="password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} fullWidth />
                        <TextField select label="Role" value={formData.role} onChange={(e) => setFormData({...formData, role:e.target.value})} fullWidth >
                            <MenuItem value="viewer">Viewer</MenuItem>
                            <MenuItem value="admin">Admin</MenuItem>
                        </TextField>
                        { formError && <Alert security="error">{formError}</Alert> }
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setCreateOpen(false)} >Cancel</Button>
                    <Button onClick={handleCreate} variant="contained" >Create</Button>
                </DialogActions>
            </Dialog>

            {/* Edir Role Dialog */}
            <Dialog open={editOpen} onClose={() => setEditOpen(false)} fullWidth maxWidth="xs">
                <DialogTitle >Change Role</DialogTitle>
                <DialogContent >
                    <Typography variant="body2" mb={2} >
                        User: <strong>{editData.email}</strong>
                    </Typography>
                    <FormControl fullWidth >
                        <InputLabel >Role</InputLabel>
                        <Select value={editData.role} label="Role" onChange={(e) => setEditData({...editData, role: e.target.value})} >
                            <MenuItem value="viewer" >Viewer</MenuItem>
                            <MenuItem value="admin" >Admin</MenuItem>
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setEditOpen(false)} >Cancel</Button>
                    <Button onClick={handleUpdateRole} variant="contained" >Update</Button>
                </DialogActions>
            </Dialog>
        </Paper>
    )

}
