import { useEffect, useState } from "react";
import api from '../services/api.js';
import ServerCard from "../components/ServerCard.jsx";
import ServerDetailsPanel from "../components/ServerDetailsPanel.jsx";
import { Grid, Box, Typography } from "@mui/material";
// import { useNavigate } from "react-router-dom";
import { logger } from "../utils/log.js";
import { useOutletContext } from "react-router-dom";

export default function Dashboard() {
    const outletContext = useOutletContext() || {};
    const { search = "", filter = "all" } = outletContext;

    
    const [servers, setServers] = useState([]);
    // const navigate = useNavigate();
    logger.info("Dashboard rendered");

    // Dummy data for testing
    // const dummyServers = [
    //     { id: 1, name: 'Server Alpha', status: 'online', cpu: '15%', memory: '2.5 GB', uptime: '3 days', type: 'outline', ip: 102 },
    //     { id: 2, name: 'Server Beta', status: 'offline', cpu: '0%', memory: '0 GB', uptime: '0', type: 'linux', ip: 103 }
    // ];


    useEffect(() => {
        api.get("/servers").then((res) => setServers(res.data));
    },[]);

    // filter and search
    const filtered = servers.filter((server) => {
        if (filter !== "all" && server.status !== filter) return false ;
        if (!search) return true;
        const normalized = search.toLowerCase();
        return server.name.toLowerCase().includes(normalized) || server.id.toLowerCase().includes(normalized);
    });

    const [ selected, setSelected ] = useState(filtered[0] || null);

    // console.log("Servers:", dummyServers);
    return (
        <Box display='flex' gap={2} >
            <Box flex='1' >
                <Typography variant="h6" gutterBottom >
                    Servers
                </Typography>

                <Grid container spacing={2} >
                    {filtered.map((serv) => (
                        <Grid key={serv.id} item xs={12} sm={6} md={4} >
                            <ServerCard server={serv} selected={selected?.id === serv.id} onClick={() => setSelected(serv)} />
                        </Grid>
                    ))}
                </Grid>

            </Box>
            
            <Box width={360} >
                <ServerDetailsPanel server={selected} />
            </Box>
            

        </Box>
    );
}