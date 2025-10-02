
import { Paper, Typography, Box, Divider, Button } from "@mui/material";

export default function ServerDetailsPanel({ server }) {
    if (!server) {
        return (
            <Paper sx={{ p: 2 }} >
                <Typography variant='subtitle1'>No Server Selected</Typography>
                <Typography variant='body2' color="text.secondary" >
                    Please select a server to see details.
                </Typography>
            </Paper>
        );
    }

    return (
        <Paper sx={{ p: 2 }} >
            <Box display='flex' justifyContent='space-between' alignContent={'center'} mb={1} >
                <Typography variant='h6'>{server.name}</Typography>
                <Button variant="outlined" size='small'>
                    Actions
                </Button>
            </Box>

            <Divider sx={{ mb: 1 }} />

            <Typography variant='body2'>Status: {server.status}</Typography>
            <Typography variant='body2'>CPU Usage: {server.cpu}% </Typography>
            <Typography variant='body2'>Memory: {server.mem} GB</Typography>
            <Typography variant='body2'>Uptime: {server.uptime} ??</Typography>

            <Box mt={2} >
                <div style={{ width: '100%', 
                    height: 120, background: '#f0f0f0', 
                    borderRadius: 6, display: 'flex', 
                    alignItems: 'center', justifyContent: 'center', 
                    color: '#9e9e9e' }} >
                        Chart Placeholder
                </div>
            </Box>
        </Paper>
    );
}