import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from '../services/api.js';
import { Container, Box, TextField, Button, Typography, Alert } from "@mui/material";
import { setAccessToken } from "../context/tokenManager.js";

export default function Setup() {
    const nav = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [busy, setBusy] = useState(false);
    const [err, setErr] = useState('');

    // Double-check they should be here
    useEffect(() => {
        api.get('/auth/setup-status')
            .then(res => {
                if (res.data.isSetupComplete) {
                    nav('/login', { replace: true });
                }
            })
            .catch(err => console.error("Setup check failed", err));
    }, [nav]);

    const onSubmit = async (e) => {
        e.preventDefault();
        setErr('');

        if (password !== confirmPassword) {
            return setErr("Passwords do not match.");
        }

        setBusy(true);
        try {
            const res = await api.post('/auth/setup', { email, password });
            
            // Log them in immediately
            if (res.data.access) {
                setAccessToken(res.data.access, res.data.ttl);
                // Hard reload to initialize AuthProvider state cleanly
                window.location.href = '/'; 
            }
        } catch (error) {
            setErr(error.response?.data?.error || "Setup failed. Please try again.");
        } finally {
            setBusy(false);
        }
    };

    return (
        <Container maxWidth='xs'>
            <Box mt={12} p={4} boxShadow={3} borderRadius={2} bgcolor="white">
                <Typography variant="h5" mb={1} align="center" fontWeight="bold">
                    System Initialization
                </Typography>
                <Typography variant="body2" mb={3} align="center" color="text.secondary">
                    Create the master administrator account.
                </Typography>
                
                <form onSubmit={onSubmit}>
                    <TextField label="Admin Email" type="email" fullWidth required value={email} onChange={(e) => setEmail(e.target.value)} sx={{ mb: 2 }} />
                    <TextField label="Password" type="password" fullWidth required value={password} onChange={(e) => setPassword(e.target.value)} sx={{ mb: 2 }} />
                    <TextField label="Confirm Password" type="password" fullWidth required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} sx={{ mb: 3 }} />
                    
                    {err && <Alert severity="error" sx={{ mb: 2 }}>{err}</Alert>}
                    
                    <Button disabled={busy} type='submit' variant='contained' color="primary" fullWidth size="large">
                        {busy ? "Configuring..." : "Complete Setup"}
                    </Button>
                </form>
            </Box>
        </Container>
    );
}