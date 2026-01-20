import { useState, useEffect } from "react";
import { Box, TextField, Button, Alert, Typography, Paper, Divider, InputAdornment } from "@mui/material";
import api from "../services/api.js";

export default function SystemSettings() {
    const [config, setConfig] = useState({ pollingInterval: 5000, batchMaxItems: 10, retentionDays: 30 });
    const [status, setStatus] = useState({ type: '', text: '' });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
            loadConfig();
    },[]);

    const loadConfig = async () => {
        try {
            const { data } = await api.get('/settings/config');
            setConfig({
                pollingInterval: data.pollingInterval,
                batchMaxItems: data.batchMaxItems,
                retentionDays: data.retentionDays,
            });
        } catch (error) {
            console.error("Failed to load global configuration:", error.message);
        }
    }

    const handleSave = async () => {
        setLoading(true);
        setStatus({ type: '', text: '' });
        try {
            await api.put('/settings/config', config);
            setStatus({ type: "success", msg: "Global configuration updated. Agents will pick this up on their next token refresh." });
        } catch (error) {
            setStatus({ type: "error", msg: error.response?.data?.error || "Failed to update global configuration." });
        } finally {
            setLoading(false);
        }   
    };

    return (
        <Paper sx={{ p: 3 }} >
            <Typography variant="h6" gutterBottom>Global Agent Configuration</Typography>
            <Typography variant="body2" color="text.secondary" >
                Configure how agents behave and how long data stored
            </Typography>

            <Divider sx={{ my: 2 }} />

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, maxWidth: 400 }} >
                <TextField label="Polling Interval (ms)" type="number" value={config.pollingInterval}
                    onChange={(e) => setConfig({ ...config, pollingInterval: Number(e.target.value )})} 
                    helperText="How often agents collect metrics (min 1000ms)"
                />
                <TextField label="Batch Max Items" type="number" value={config.batchMaxItems}
                    onChange={(e) => setConfig({ ...config, batchMaxItems: Number(e.target.value )})} 
                    helperText="Max metric points to send in one request"
                />

                <Divider />

                <Typography variant="subtitle2" color="primary" >
                    Data Storage
                </Typography>

                <TextField 
                    label="Data Retention (days)" 
                    type="number"
                    value={config.retentionDays}
                    onChange={(e) => setConfig({ ...config, retentionDays: Number(e.target.value) })}
                    slotProps={{
                        input: {
                            endAdornment: <InputAdornment position="end">Days</InputAdornment>
                        }
                    }}
                    helperText="Metrics older than this will be deleted every night."
                />

                { status.msg && <Alert severity={status.type}>{status.msg}</Alert>}
                <Button variant="contained" onClick={handleSave} disabled={loading} >{ loading ? "Saving..." : "Save Configuration" }</Button>
            </Box>
        </Paper>
    )
    
}