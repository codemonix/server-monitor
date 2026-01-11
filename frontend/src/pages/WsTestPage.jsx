import { useEffect, useState } from "react";
// import { Box, Typography, Button } from "@mui/material";
import wsService from "../services/webSocketService.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function WsTestPage() {
    const { accessToken, logout } = useAuth();
    const [ connected, setConnected ] = useState(false);
    const [ log, setLog ] = useState([]);

    useEffect(() => {
        if (!accessToken) return;

        console.log(" Connecting to WebSocket ....");
        // wsService.connect(accessToken, {
        //     onOpen: () => {
        //         console.log('🟢 Dashboard WebSocket connected');
        //         setConnected(true);
        //         setLog(prev => [...prev, 'Connected to WebSocket'])
        //     },
        //     onMessage: (msg) => setLog(prev => [...prev, `Received: ${JSON.stringify(msg)}`]),
        //     onClose: (event) => {
        //         setConnected(false);
        //         if (event.code === 4003) {
        //             setLog( prev => [...prev, "⚠️ Session expired — logging out"]);
        //             logout();
        //         } else {
        //             setLog( prev => [...prev, `Connection closed: ${event.code}` ]);
        //         }
        //     },
        //     onError: (err) => setLog( prev => [...prev , `Error: ${err.message || err}`] )
        // });
        try {
            wsService.connect(accessToken);
            setLog(prev => [...prev, 'Connected to WebSocket']);
            setConnected(true);

        } catch (error) {
            console.error("WebSocket connection error:", error);
            setLog(prev => [...prev, `Connection error: ${error.message || error}`]);
        }





        // Cleanup on unmount

        return () => {
            console.log("Disconnecting WebSocket...");
            wsService.disconnect();
            setConnected(false);
        };
    },[accessToken]);

    const handleSendTest = () => {
        wsService.send({ type: 'test', content: 'Ping from client'});
    };

    return (
        <div style={{ padding: '2rem'}}>
            <h2>WebSocket Test Page</h2>
            <p>Status: {connected ? '🟢 Connected' : '🔴 Disconnected'} </p>

            <button onClick={handleSendTest} disabled={!connected}>
                Send Test Message
            </button>

            <div style={{
                marginTop: '1rem',
                padding: '1rem',
                background: '#f4f4f4',
                borderRadius: '8px',
                height: '300px',
                overflow: 'auto',
            }}>
                {log.map((line, i) => (
                    <div key={i}>{line}</div>
                ))}
            </div>

        </div>
    )
}