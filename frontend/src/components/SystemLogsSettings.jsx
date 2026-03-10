import { useState, useEffect } from "react";
import { 
    Box, TextField, Button, Alert, Typography, Paper, Divider, 
    FormControlLabel, Switch, MenuItem, FormControl, InputLabel, Select 
} from "@mui/material";
import api from "../services/api.js";
import { logger } from "../utils/log.js";

export default function SystemLogsSettings() {
    const [logConfig, setLogConfig] = useState({ 
        logLevel: 'info', 
        logToFile: true, 
        logRetentionDays: '14d', 
        logMaxFileSize: '20m' 
    });
    const [status, setStatus] = useState({ type: '', text: '' });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadConfig();
    }, []);

    const loadConfig = async () => {
        try {
            const { data } = await api.get('/settings/config');
            setLogConfig({
                logLevel: data.logLevel || 'info',
                logToFile: data.logToFile ?? true,
                logRetentionDays: data.logRetentionDays || '14d',
                logMaxFileSize: data.logMaxFileSize || '20m',
            });
        } catch (error) {
            logger.error("Failed to load logging configuration:", error.message);
        }
    };

    const handleSave = async () => {
        setLoading(true);
        setStatus({ type: '', text: '' });
        try {
            logger.debug("SystemLogsSettings.jsx -> handleSave -> logConfig:", logConfig);
            await api.put('/settings/config', logConfig);
            setStatus({ type: "success", text: "Logging configuration updated successfully. Changes are applied instantly." });
        } catch (error) {
            setStatus({ type: "error", text: error.response?.data?.error || "Failed to update logging configuration." });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>System Logs Configuration</Typography>
            <Typography variant="body2" color="text.secondary">
                Dynamically adjust the backend logging verbosity and file rotation settings without restarting the server.
            </Typography>

            <Divider sx={{ my: 2 }} />

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, maxWidth: 400 }}>
                
                <FormControl fullWidth>
                    <InputLabel>Log Level</InputLabel>
                    <Select
                        value={logConfig.logLevel}
                        label="Log Level"
                        onChange={(e) => setLogConfig((prev) => {
                            console.log("SystemLogsSettings.jsx -> e.target.value:", e.target.value);
                            return { ...prev, logLevel: e.target.value };
                        })}
                    >
                        <MenuItem value="error">Error (Only critical failures)</MenuItem>
                        <MenuItem value="warn">Warn (Warnings & Errors)</MenuItem>
                        <MenuItem value="info">Info (Standard operations)</MenuItem>
                        <MenuItem value="http">HTTP (Includes Morgan web requests)</MenuItem>
                        <MenuItem value="debug">Debug (Maximum verbosity)</MenuItem>
                    </Select>
                </FormControl>

                <FormControlLabel 
                    control={
                        <Switch 
                            checked={logConfig.logToFile}
                            onChange={(e) => setLogConfig({ ...logConfig, logToFile: e.target.checked })}
                        />
                    }
                    label="Save Logs to File (Winston Daily Rotate)"
                />

                <TextField 
                    label="Retention Period" 
                    value={logConfig.logRetentionDays}
                    onChange={(e) => setLogConfig({ ...logConfig, logRetentionDays: e.target.value })} 
                    helperText="Format: '14d' for 14 days, or '30' for 30 files."
                    disabled={!logConfig.logToFile}
                />

                <TextField 
                    label="Max File Size" 
                    value={logConfig.logMaxFileSize}
                    onChange={(e) => setLogConfig({ ...logConfig, logMaxFileSize: e.target.value })} 
                    helperText="Format: '20m' for 20 Megabytes, '1g' for 1 Gigabyte."
                    disabled={!logConfig.logToFile}
                />

                {status.text && <Alert severity={status.type}>{status.text}</Alert>}
                
                <Button variant="contained" onClick={handleSave} disabled={loading}>
                    {loading ? "Applying..." : "Apply Logging Settings"}
                </Button>
            </Box>
        </Paper>
    );
}