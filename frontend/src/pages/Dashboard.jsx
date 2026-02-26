import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import useWebsocketConnection from "../hooks/useWebsocketConnection.js";
import ServerCard from "../components/ServerCard.jsx";
import ServerDetailsPanel from "../components/ServerDetailsPanel.jsx";
import { Grid, Box, Typography, Slide, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close"
import { logger } from "../utils/log.js";
import { fetchServerStats } from "../redux/thunks/metricsThunks.js";

export default function Dashboard() {
    const dispatch = useDispatch();
    const { items: allServers, hiddenAgentIds } = useSelector((state) => state.metrics);

    // const state = useSelector((state) => state); // Should be removed later
    
    
    // const [servers, setServers] = useState([]);
    logger.info("Dashboard rendered");
    // http poll every 10 second
    useEffect(() => {
        dispatch(fetchServerStats())
        const interval = setInterval(() => dispatch(fetchServerStats()), 10000);
        return () => clearInterval(interval);
    },[dispatch]);
    
    useWebsocketConnection()
    
    // filter out hiden servers
    const servers = allServers.filter(server => !hiddenAgentIds.includes(server._id));

    const [ selectedServer, setSelectedServer ] = useState(null);

    console.log("Dashboard.jsx -> filtered servers:", selectedServer);

    return (
        <Box display='flex' flexDirection='column' minHeight='95vh' sx={{ bgcolor: 'grey.500', p: 1 }} >
            <Box flex={ selectedServer ? '1 1 50%' : '1 1 auto'} overflow='auto' >
                <Grid container spacing={1} >
                    {servers.map((serv) => (
                        <Grid 
                            key={serv._id} 
                            size={{ xs: 12, sm: 6, md: 4, lg: 3, xl: 2 }}
                        >
                            <ServerCard server={serv} selected={selectedServer?._id === serv._id} onClick={() => setSelectedServer(serv)} />
                        </Grid>
                    ))}
                    {servers.length === 0 && (
                        <Typography color="white" sx={{ p: 2 }} >No agent selected or available.</Typography>
                    )}
                </Grid>
            </Box>

            {/* detail panel */}
            <Slide direction="up" in={!!selectedServer} mountOnEnter unmountOnExit >
                <Box sx={{
                    flex: "0 0 50%",
                    position: 'relative',
                    bgcolor: 'grey.600',
                    borderTop: '1px solid',
                    borderColor: 'divider',
                    boxShadow: 3,
                    overflow: 'auto',
                }} >
                    <IconButton 
                        size='small'
                        sx={{ position: 'absolute', top: 8, right: 8 }}
                        onClick={() => setSelectedServer(null)}
                    >
                        <CloseIcon />
                    </IconButton>
                    <ServerDetailsPanel server={selectedServer} />
                </Box>
            </Slide>
        </Box>
    );
}