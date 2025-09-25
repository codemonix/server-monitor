import { useEffect, useState } from "react";
import api from '../services/api.js';
import ServerCard from "../components/ServerCard.jsx";
import { Grid } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { logger } from "../utils/log.js";

export default function Dashboard() {
    const [servers, setServers] = useState([]);
    const navigate = useNavigate();
    logger.info("Dashboard rendered");

    // Dummy data for testing
    const dummyServers = [
        { id: 1, name: 'Server Alpha', status: 'online', cpu: '15%', memory: '2.5 GB', uptime: '3 days', type: 'outline', ip: 102 },
        { id: 2, name: 'Server Beta', status: 'offline', cpu: '0%', memory: '0 GB', uptime: '0', type: 'linux', ip: 103 }
    ];


    useEffect(() => {
        api.get("/servers").then((res) => setServers(res.data));
    },[]);
    console.log("Servers:", dummyServers);
    return (
        <Grid container spacing={2}>
            {servers.map(server => (
                <Grid item xs={12} sm={6} md={4} key={server.id}>
                    <h1 >Server 1</h1>
                    <ServerCard server={dummyServers} onClick={() => navigate(`/servers/${server.id}`)} />
                </Grid>
            ))}
        </Grid>
    );
}