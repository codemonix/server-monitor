import { useState, useEffect } from "react";
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Button, TextField, Typography, Alert
} from "@mui/material";
import api from "../services/api.js";

export default function ResetPasswordDialog({ open, onClose, user }) {
    const [password, setPassword] = useState("");
    const [status, setStatus] = useState({ type: '', msg: '' });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (open) {
            setPassword('');
            setStatus({ type: '', msg: '' });
        }
    },[open, user]);

    const handleReset = async () => {
        if (!password || password.length < 6) {
            setStatus({ type: 'error', msg: 'Password must be at least 6 characters long.' });
            return;
        }

        setLoading(true);
        setStatus({ type: '', msg: '' });
        try {
            await api.put(`/users/${user._id}/password`, { password });
            setStatus({ type: 'success', msg: 'Password reset successfully' });
            setTimeout(() => {
                onClose();
            }, 1500);
        } catch (error) {
            setStatus({ type: 'error', msg: error.response?.data?.error || 'Failed to reset password' });
        } finally {
            setLoading(false);
        }
    }

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
            <DialogTitle>Reset Password</DialogTitle>
            <DialogContent>
                <Typography variant="body2" mb={2}>
                    For user: <strong>{user?.email}</strong>
                </Typography>
                <TextField 
                    label="New Password" 
                    type="password" 
                    fullWidth 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    autoFocus
                    margin="dense"
                />
                {status.msg && <Alert severity={status.type} sx={{ mt: 2 }}>{status.msg}</Alert>}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} disabled={loading}>Cancel</Button>
                <Button onClick={handleReset} variant="contained" color="warning" disabled={loading}>
                    Reset
                </Button>
            </DialogActions>
        </Dialog>
    )
}