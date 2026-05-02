import { useEffect, useState } from "react";
import { useAppSelector, useAppDispatch } from "../redux/hooks.js";
import { Grid, Box, Typography, Slide, IconButton, Paper } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

import useWebsocketConnection from "../hooks/useWebsocketConnection.js";
import ServerCard from "../components/ServerCard.js";
import ServerDetailsPanel from "../components/ServerDetailsPanel.js";
import { fetchServerStats } from "../redux/thunks/metricsThunks.js";

export default function Dashboard() {
    const dispatch = useAppDispatch();
    const { items: allServers, hiddenAgentIds } = useAppSelector((state) => state.metrics);

    useEffect(() => {
        dispatch(fetchServerStats());
        const interval = setInterval(() => dispatch(fetchServerStats()), 10000);
        return () => clearInterval(interval);
    }, [dispatch]);
    
    useWebsocketConnection();
    
    const servers = allServers.filter(server => !hiddenAgentIds.includes(server._id));
    const [selectedServer, setSelectedServer] = useState(null);

    return (
        <Box 
            display='flex' 
            flexDirection='column' 
            height='calc(100vh - 96px)' 
            sx={{ overflow: 'hidden' }} 
        >
            <Box 
                flex={selectedServer ? '1 1 50%' : '1 1 100%'} 
                sx={{ overflowY: 'auto', p: 1, transition: 'flex 0.3s ease-in-out' }} 
            >
                <Grid container spacing={2}>
                    {servers.map((serv) => (
                        <Grid key={serv._id} size={{ xs: 12, sm: 6, md: 4, lg: 3, xl: 2 }}>
                            <ServerCard 
                                server={serv} 
                                selected={selectedServer?._id === serv._id} 
                                onClick={() => setSelectedServer(serv)} 
                            />
                        </Grid>
                    ))}
                    {servers.length === 0 && (
                        <Typography color="text.secondary" sx={{ p: 3, width: '100%', textAlign: 'center' }}>
                            No agents currently available or selected.
                        </Typography>
                    )}
                </Grid>
            </Box>

            <Slide direction="up" in={!!selectedServer} mountOnEnter unmountOnExit>
                <Paper 
                    elevation={8}
                    sx={{
                        flex: "0 0 50%", 
                        position: 'relative',
                        borderTop: '1px solid',
                        borderColor: 'divider',
                        borderRadius: '16px 16px 0 0',
                        overflow: 'hidden', // STRICT BOUNDARY: No scrollbars allowed
                        display: 'flex',
                        flexDirection: 'column',
                        p: 2,
                    }} 
                >
                    <IconButton 
                        size='small'
                        sx={{ position: 'absolute', top: 12, right: 12, zIndex: 10 }}
                        onClick={() => setSelectedServer(null)}
                    >
                        <CloseIcon />
                    </IconButton>
                    <ServerDetailsPanel server={selectedServer} />
                </Paper>
            </Slide>
        </Box>
    );
}