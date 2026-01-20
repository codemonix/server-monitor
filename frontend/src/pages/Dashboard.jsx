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
// import { useOutletContext } from "react-router-dom";
import { fetchServerStats } from "../redux/thunks/metricsThunks.js";

export default function Dashboard() {
    // const outletContext = useOutletContext() || {};
    // const { search = "", filter = "all" } = outletContext;
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

    const [ selected, setSelected ] = useState(null);

    // Enable this if you need auto select
    useEffect(() => {
        if (servers.length > 0 && !selected)  {
            setSelected(servers[0]);
        } else if (selected && hiddenAgentIds.includes(selected._id)) {
            setSelected(servers.length > 0 ? servers[0] : null) 
        }
    }, [servers, selected, hiddenAgentIds]);
    

    console.log("Dashboard.jsx -> filtered servers:", selected);

    // const [ selected, setSelected ] = useState(filtered[0] || null);
    return (
        <Box display='flex' flexDirection='column' minHeight='95vh' sx={{ bgcolor: 'grey.500', p: 1 }} >
            <Box flex={ selected ? '1 1 50%' : '1 1 auto'} overflow='auto' >
                <Typography variant="h6" gutterBottom color="white" >
                    Servers
                </Typography>
                <Grid container spacing={1} >
                    {servers.map((serv) => (
                        <Grid key={serv._id} item xs={12} sm={6} lg={3} xl={2} >
                            <ServerCard server={serv} selected={selected?._id === serv._id} onClick={() => setSelected(serv)} />
                        </Grid>
                    ))}
                    {servers.length === 0 && (
                        <Typography color="white" sx={{ p: 2 }} >No agent selected or available.</Typography>
                    )}
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