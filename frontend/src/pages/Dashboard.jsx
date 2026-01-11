import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
// import { fetchServerDetails } from "../redux/thunks/serverDetailsThunks.js";
import useWebsocketConnection from "../hooks/useWebsocketConnection.js";
// import api from '../services/api.js';
import ServerCard from "../components/ServerCard.jsx";
import ServerDetailsPanel from "../components/ServerDetailsPanel.jsx";
import { Grid, Box, Typography, Slide, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close"
import { logger } from "../utils/log.js";
import { useOutletContext } from "react-router-dom";
import { fetchServerStats } from "../redux/thunks/metricsThunks.js";

export default function Dashboard() {
    const outletContext = useOutletContext() || {};
    const { search = "", filter = "all" } = outletContext;
    const dispatch = useDispatch();
    const { items: servers } = useSelector((state) => state.metrics);

    const state = useSelector((state) => state);
    
    
    // const [servers, setServers] = useState([]);
    logger.info("Dashboard rendered");
    // http poll every 10 second
    useEffect(() => {
        dispatch(fetchServerStats())
        const interval = setInterval(() => dispatch(fetchServerStats()), 10000);
        return () => clearInterval(interval);
    },[dispatch]);
    
    useWebsocketConnection()
    console.log(" dashboard.jsx -> stor:", state);

    // filter and search
    const filtered = servers.filter((server) => {
        // logger.debug("Dashboard.jsx -> server:")
        // console.log(server);
        if (filter !== "all" && server.status !== filter) return false ;
        if (!search) return true;
        const normalized = search.toLowerCase();
        return server.name.toLowerCase().includes(normalized) || server.id.toLowerCase().includes(normalized);
    },[]);

    console.log("Dashboard.jsx -> filtered servers:", filtered);

    const [ selected, setSelected ] = useState(filtered[0] || null);
    return (
        <Box display='flex' flexDirection='column' minHeight='95vh' sx={{ bgcolor: 'grey.500', p: 1 }} >
            <Box flex={ selected ? '1 1 50%' : '1 1 auto'} overflow='auto' >
                <Typography variant="h6" gutterBottom color="white" >
                    Servers
                </Typography>
                <Grid container spacing={1} >
                    {filtered.map((serv) => (
                        <Grid key={serv._id}  >
                            <ServerCard server={serv} selected={selected?._id === serv._id} onClick={() => setSelected(serv)} />
                        </Grid>
                    ))}
                </Grid>
            </Box>

            {/* detail panel */}
            <Slide direction="up" in={!!selected} mountOnEnter unmountOnExit >
                <Box sx={{
                    flex: "0 0 50%",
                    position: 'relative',
                    bgcolor: 'grey.600',
                    borderTop: '1px solid',
                    borderColor: 'divider',
                    // height: '20vh',
                    // m: 10,
                    // p: 10,
                    boxShadow: 3,
                    overflow: 'auto',
                }} >
                    <IconButton 
                        size='small'
                        sx={{ position: 'absolute', top: 8, right: 8 }}
                        onClick={() => setSelected(null)}
                    >
                        <CloseIcon />
                    </IconButton>
                    <ServerDetailsPanel server={selected} />

                </Box>
            </Slide>
        </Box>
    );
}