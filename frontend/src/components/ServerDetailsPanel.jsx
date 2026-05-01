import { Box, Typography, Divider, Checkbox, FormControlLabel, Chip } from "@mui/material";
import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { selectChartData } from "../redux/slices/serverDetailsSlice.js";
import { fetchServerDetails } from "../redux/thunks/serverDetailsThunks.js";
import MultiMetricChart from "./MultiMetricChart.jsx";
import { formatTimeSeconds } from "../utils/format.js";

export default function ServerDetailsPanel({ server }) {
    const dispatch = useDispatch();
    const chartData = useSelector(selectChartData);

    const [selected, setSelected] = useState({
        cpu: true, memory: true, disk: true, network: true
    });

    const toggleMetrics = (key) => {
        setSelected((prev) => ({ ...prev, [key]: !prev[key] }));
    };

    useEffect(() => {
        if (server) dispatch(fetchServerDetails(server._id));
    }, [server, dispatch]);

    if (!server) return null;

    return (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            
            {/* Highly Compressed Header Row */}
            <Box display='flex' justifyContent='space-between' alignItems='center' pr={4}>
                <Box display="flex" alignItems="center" gap={2}>
                    <Typography variant='h6' fontWeight="600" lineHeight={1}>{server.name}</Typography>
                    <Chip 
                        size="small" 
                        label={server.status} 
                        color={server.status === 'online' ? 'success' : server.status === 'offline' ? 'error' : 'warning'} 
                        sx={{ height: 20, fontSize: '0.7rem', fontWeight: 'bold' }}
                    />
                </Box>

                {/* Filters moved to the header to save space */}
                <Box display="flex" gap={1}>
                    {['cpu', 'memory', 'disk', 'network'].map((key) => (
                        <FormControlLabel 
                            key={key}
                            sx={{ m: 0 }}
                            control={
                                <Checkbox 
                                    size="small"
                                    sx={{ py: 0 }}
                                    checked={selected[key]} 
                                    onChange={() => toggleMetrics(key)} 
                                />
                            }
                            label={<Typography variant="caption" sx={{ textTransform: 'capitalize' }}>{key}</Typography>}
                        />
                    ))}
                </Box>
            </Box>

            <Divider sx={{ my: 1 }} />
            
            {/* Dense Hardware Specs Row */}
            <Box display="flex" flexWrap="nowrap" gap={3} mb={1} sx={{ overflowX: 'auto', whiteSpace: 'nowrap', flexShrink: 0 }}>
                <Typography variant='body2' color="text.secondary">
                    <Typography component="span" fontWeight="bold" color="text.primary">CPU:</Typography> {server.cpuModel}
                </Typography>
                <Typography variant='body2' color="text.secondary">
                    <Typography component="span" fontWeight="bold" color="text.primary">Memory:</Typography> {(server.memTotal / (1024 ** 3)).toFixed(2)} GB
                </Typography>
                <Typography variant='body2' color="text.secondary">
                    <Typography component="span" fontWeight="bold" color="text.primary">Uptime:</Typography> {formatTimeSeconds(server.upTime)}
                </Typography>
            </Box>

            {/* 
               Fluid Chart Wrapper
               The absolute position trick guarantees the chart will never stretch the parent container,
               forcing it to exactly fit the remaining available space.
            */}
            <Box flex={1} minHeight={0} sx={{ position: 'relative' }}>
                <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
                    <MultiMetricChart 
                        selected={selected}
                        chartData={chartData}
                    />
                </Box>
            </Box>
        </Box>
    );
}