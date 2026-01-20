import { useState } from "react";
import { Box, TextField, Button, Alert, Typography, Paper } from "@mui/material";
import api  from "../services/api.js";

export default function ProfileSettings() {
    const [passwords, setPassword] = useState({ current: '', new: '', confirm: '' });
    const [status, setStatus] = useState({ type: '', text: '' });
    const [loading, setLoading] = useState(false);


    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus({ type: '', text: '' });

        if (passwords.new !== passwords.confirm) {
            setStatus({ type: 'error', text: "New passwords do not match." });
            return;
        }

        setLoading(true);
        try {
            await api.put('/settings/profile/password', {
                currentPassword: passwords.current,
                newPassword: passwords.new,
            });
            setStatus({ type: 'success', text: "Password changed successfully." });
            setPassword({ current: '', new: '', confirm: '' });
        } catch (error) {
            setStatus({ type: 'error', text: error.response?.data?.error || "Failed to change password." });
        } finally {
            setLoading(false);
        }
    };
    return (
        <Paper sx={{ p: 3 }} >
            <Typography variant="h6" gutterBottom >Change Password</Typography>
            <form onSubmit={handleSubmit} >
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 400 }} >
                    <TextField label="Current Password" type="password" size="small" value={passwords.current} 
                        onChange={(e) => setPassword({ ...passwords, current: e.target.value})} required
                    />
                    <TextField label="New Password" type="password" size="small" value={passwords.new} 
                        onChange={(e) => setPassword({ ...passwords, new: e.target.value})} required
                    />
                    <TextField label="Confirm New Password" type="password" size="small" value={passwords.confirm} 
                        onChange={(e) => setPassword({ ...passwords, confirm: e.target.value})} required
                    />
    
                    {status.msg && <Alert severity={status.type} >{status.msg}</Alert>}
                    <Button variant="contained" type="submit" disabled={loading} >{ loading ? "Updating..." : "Update Password"}</Button>
                </Box>
            </form>
        </Paper>
    )
};
