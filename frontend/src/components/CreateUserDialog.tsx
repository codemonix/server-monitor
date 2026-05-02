import { useState, useEffect } from "react";
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Button, TextField, Typography, Alert, Box, MenuItem
} from "@mui/material";
import api from "../services/api.js";


export default function CreateUserDialog({ open, onClose, onSuccess}) {
    const [formData, setFormData] = useState({ email: "", password: "", role: "viewer" });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (open) {
            setFormData({ email: "", password: "", role: "viewer" });
            setError("");
        }
    }, [open]);

    const handleCreate = async () => {
        setLoading(true);
        setError("");
        try {
            await api.post('/users', formData);
            onSuccess();
            onClose();
        } catch (error) {
            setError(error.response?.data?.error || "Failed to create user.");
        } finally {
            setLoading(false);
        }
    };
    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>Add User</DialogTitle>
            <DialogContent>
                <Box display="flex" flexDirection="column" gap={2} mt={1}>
                    <TextField 
                        label="Email" 
                        fullWidth 
                        value={formData.email} 
                        onChange={(e) => setFormData({...formData, email: e.target.value})} 
                    />
                    <TextField 
                        label="Password" 
                        type="password" 
                        fullWidth 
                        value={formData.password} 
                        onChange={(e) => setFormData({...formData, password: e.target.value})} 
                    />
                    <TextField 
                        select 
                        label="Role" 
                        fullWidth 
                        value={formData.role} 
                        onChange={(e) => setFormData({...formData, role: e.target.value})}
                    >
                        <MenuItem value="viewer">Viewer</MenuItem>
                        <MenuItem value="admin">Admin</MenuItem>
                    </TextField>
                    {error && <Alert severity="error">{error}</Alert>}
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} disabled={loading}>Cancel</Button>
                <Button onClick={handleCreate} variant="contained" disabled={loading}>
                    Create
                </Button>
            </DialogActions>
        </Dialog>
    );
}