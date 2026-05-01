import { Card, CardContent, Typography, Box, Chip, alpha } from "@mui/material";
import { Speed, Storage, Memory, AccessTime } from "@mui/icons-material";
import { StatusPill } from "./StatusPill.jsx";
import { statusColors } from "../utils/getAgentStatus.js";
import { formatTimeSeconds } from "../utils/format.js";

function correctNumToTwo(value) {
    const num = Number(value);
    return isFinite(num) ? num.toFixed(2) : "0.00";
}

export default function ServerCard({ server, selected, onClick }) {
    const memPercent = server.memTotal ? (server.memUsed / server.memTotal) * 100 : 0;
    const diskPercent = server.diskTotal ? (server.diskUsed / server.diskTotal) * 100 : 0;

    return (
        <Card 
            onClick={onClick}
            elevation={selected ? 4 : 1}
            sx={{
                cursor: 'pointer',
                bgcolor: 'background.paper', 
                border: '1px solid',
                borderColor: selected ? 'primary.main' : 'divider',
                position: 'relative',
                transition: 'all 0.2s ease-in-out',
                transform: selected ? 'translateY(-2px)' : 'none',
                '&:hover': {
                    borderColor: selected ? 'primary.main' : 'text.disabled',
                    transform: 'translateY(-2px)',
                    boxShadow: (theme) => theme.shadows[4],
                },
                boxShadow: selected 
                    ? (theme) => `0 4px 12px ${alpha(theme.palette.primary.main, 0.4)}` 
                    : undefined,
            }}
        >
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Box display='flex' justifyContent='space-between' alignItems='flex-start' mb={2}>
                    <Typography variant='subtitle1' fontWeight={600} noWrap sx={{ pr: 1, color: 'text.primary' }}>
                        {server.name}
                    </Typography>
                    <Chip 
                        label={server.status} 
                        size="small" 
                        sx={{
                            height: 20,
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            backgroundColor: statusColors[server.status] || 'grey.500',
                            // Use a slightly transparent white to reduce glare on the colored badge
                            color: 'rgba(255, 255, 255, 0.9)', 
                            flexShrink: 0
                        }} 
                    />
                </Box>

                <Box display='flex' flexDirection='column' gap={1.5}>
                    <Box display='flex' alignItems='center' gap={1.5}>
                        {/* Changed color="action" to sx={{ color: 'text.secondary' }} for softer icons */}
                        <Speed fontSize="small" sx={{ color: 'text.secondary' }} />
                        <StatusPill value={server.cpu} label={`${correctNumToTwo(server.cpu)}%`} />
                    </Box>
                    <Box display='flex' alignItems='center' gap={1.5}>
                        <Memory fontSize="small" sx={{ color: 'text.secondary' }} />
                        <StatusPill 
                            value={memPercent} 
                            label={`${correctNumToTwo(server.memUsed / (1024 ** 3))}GB / ${correctNumToTwo(server.memTotal / (1024 ** 3))}GB`} 
                        />
                    </Box>
                    <Box display='flex' alignItems='center' gap={1.5}>
                        <Storage fontSize="small" sx={{ color: 'text.secondary' }} />
                        <StatusPill 
                            value={diskPercent} 
                            label={`${correctNumToTwo(server.diskUsed / (1024 ** 3))}GB / ${correctNumToTwo(server.diskTotal / (1024 ** 3))}GB`} 
                        />
                    </Box>
                    <Box display='flex' alignItems='center' gap={1.5}>
                        <AccessTime fontSize="small" sx={{ color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary" fontWeight={500}>
                            {formatTimeSeconds(server.upTime)}
                        </Typography>
                    </Box>
                </Box>
            </CardContent>
        </Card>
    );
}