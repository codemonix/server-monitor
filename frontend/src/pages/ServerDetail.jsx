import { useParams } from "react-router-dom";
import useServerStats from "../hooks/useServerStats.js";
import CpuChart from "../components/CpuChart.jsx";
import MemoryChart from "../components/MemoryChart.jsx";
import DiskChart from "../components/DiskChart.jsx";
import NetworkChart from "../components/NetworkChart.jsx";
import { Typography, Grid } from "@mui/material";

export default function ServerDetail() {
    const { id } = useParams();
    const stats = useServerStats(id);

    if (!stats) return <p>Loading ....</p>

    return (
        <div >
            <Typography variant='h4' >{stats.name}</Typography>
            <Grid container spacing={2}>
                <Grid item xs={12} md={6} ><CpuChart data={stats.cpuHistory} /></Grid>
                <Grid item xs={12} md={6} ><MemoryChart data={stats.memoryHistory} /> </Grid>
                <Grid item xs={12} md={6} ><DiskChart data={stats.diskHistory} /> </Grid>
                <Grid item xs={12} md={6} ><NetworkChart data={stats.networkHistory} /> </Grid>
            </Grid>
        </div>
    )
}
