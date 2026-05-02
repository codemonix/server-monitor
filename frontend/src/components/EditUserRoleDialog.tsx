import { useState, useEffect } from "react";
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Button, Typography, FormControl, InputLabel, Select, MenuItem, Alert
} from "@mui/material";
import api from "../services/api.js";

export default function EditUserRoleDialog({ open, onClose, user, onSuccess }) {
    const [role, setRole] = useState("viewer");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(()=> {
        if (open && user) {
            setRole(user.role || 'viewer');
            setError('');
        }
    },[open, user]);

    const handleUpdate = async () => {
        setLoading(true);
        setError("");
        try {
            await api.put(`/users/${user._id}/role`, { role });
            onSuccess(); // Refresh list in parent
            onClose();
        } catch (err) {
            setError(err.response?.data?.error || "Failed to update role.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
            <DialogTitle>Change Role</DialogTitle>
            <DialogContent>
                <Typography variant="body2" mb={2}>
                    User: <strong>{user?.email}</strong>
                </Typography>
                <FormControl fullWidth margin="dense">
                    <InputLabel>Role</InputLabel>
                    <Select value={role} label="Role" onChange={(e) => setRole(e.target.value)}>
                        <MenuItem value="viewer">Viewer</MenuItem>
                        <MenuItem value="admin">Admin</MenuItem>
                    </Select>
                </FormControl>
                {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} disabled={loading}>Cancel</Button>
                <Button onClick={handleUpdate} variant="contained" disabled={loading}>
                    Update
                </Button>
            </DialogActions>
        </Dialog>
    );


}