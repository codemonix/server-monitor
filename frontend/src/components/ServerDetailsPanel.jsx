
import { Paper, Typography, Box, Divider, Checkbox, FormControlLabel } from "@mui/material";

import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { selectChartData } from "../redux/slices/serverDetailsSlice.js";
import { fetchServerDetails } from "../redux/thunks/serverDetailsThunks.js";
import MultiMetricChart from "./MultiMetricChart.jsx";


export default function ServerDetailsPanel({ server }) {

    console.log("ServerDetailsPanel.jsx -> server:", server);

    const dispatch = useDispatch();
    const chartData = useSelector(selectChartData);

    const [ selected, setSelected ] = useState({
        cpu: true,
        memory: true,
        disk: true,
        network: true
    });

    const toggleMetrics = (key) => {
        setSelected((prev) => ({
            ...prev,
            [key]: !prev[key]
        }));
    };
    useEffect(() => {
        if (server) {
            dispatch(fetchServerDetails(server._id));
        }
    }, [server, dispatch]);

    function formatUpTime(seconds) {


        console.log("ServerDetailsPanel.jsx -> formatUpTime -> seconds:", seconds);
        const days = Math.floor(seconds / (3600 * 24));
        seconds %= 3600 * 24;
        const hours = Math.floor(seconds / 3600);
        seconds %= 3600;
        const minutes = Math.floor(seconds / 60);

        return seconds ? `${days}d ${hours}h ${minutes}m` : "--";
    }

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
    console.log("ServerDetailsPanel.jsx -> chartData:", chartData);
    return (
        <Paper sx={{ p: 1 }}>
            <Box display='flex' justifyContent='space-between' alignContent={'center'}  >
                <Typography variant='h6'>{server.name}</Typography>
                {/* <Button variant="outlined" size='small'>
                    Actions
                </Button> */}
            </Box>

            <Divider sx={{ mb: 1 }} />
            <Box display="flex" flexDirection="row" gap={2}>
                <Typography variant='body2'>Status: {server.status}</Typography>
                <Typography variant='body2'>CPU Model: {server.cpuModel} </Typography>
                <Typography variant='body2'>Memory: {(server.memTotal / (1000 * 1000 * 1000)).toFixed(2)} GB</Typography>
                <Typography variant='body2'>Uptime: {formatUpTime(server.upTime)}</Typography>
            </Box>

            <Box mt={0.5} >
                <FormControlLabel 
                    control={
                        <Checkbox checked={selected.cpu} 
                            onChange={() => toggleMetrics('cpu')} 
                        />
                    }
                    label="CPU"
                />

                <FormControlLabel 
                    control={
                        <Checkbox checked={selected.memory}
                            onChange={() => toggleMetrics('memory')}
                        />
                    }
                    label="Memory"
                />

                <FormControlLabel 
                    control={
                        <Checkbox checked={selected.disk}
                            onChange={() => toggleMetrics('disk')}
                        />
                    }
                    label="Disk"
                />

                <FormControlLabel 
                    control={
                        <Checkbox checked={selected.network}
                            onChange={() => toggleMetrics('network')}   
                        />
                    }
                    label="Network"
                />
            </Box>

            <MultiMetricChart 
                title={"Server Metrics"}
                selected={selected}
                chartData={chartData}
            />
        </Paper>
    );
}