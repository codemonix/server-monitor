import { useEffect, useState } from "react";
import api from '../services/api.js';
import ServerCard from "../components/ServerCard.jsx";
import { Grid } from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
    const [servers, setServers] = useState([]);
    const navigate = useNavigate();
    console.log("Dashboard render");

    useEffect(() => {
        api.get("/servers").then((res) => setServers(res.data));
    },[]);

    return (
        <Grid container spacing={2}>
            {servers.map(server => (
                <Grid item xs={12} sm={6} md={4} key={server.id}>
                    <ServerCard server={server} onClick={() => navigate(`/servers/${server.id}`)} />
                </Grid>
            ))}
        </Grid>
    );
}