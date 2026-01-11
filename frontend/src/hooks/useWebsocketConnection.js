import { useEffect, useRef } from "react";
import wsService from "../services/webSocketService.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function useWebsocketConnection() {
    const { accessToken } = useAuth();
    const hasConnected = useRef(false);

    useEffect(() => {
        console.log("useWebsocketConnection.js [WS] hook -> token:", accessToken)
        if (!accessToken || hasConnected.current) return;

        console.log("useWebsocketConnection.js -> try to connect to with token [WS]")
        wsService.connect(accessToken);
        hasConnected.current = true;
        return () => {
            console.log("useWebsocketConnection.js -> disconnecting ws on unmount");
            wsService.disconnect();
            hasConnected.current = false;
        };
    }, [accessToken])
}