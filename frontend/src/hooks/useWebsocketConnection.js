import { useEffect, useRef } from "react";
import wsService from "../services/webSocketService.js";
import { useAuth } from "../context/AuthContext.jsx";
import { logger } from "../utils/log.js";

export default function useWebsocketConnection() {
    const { accessToken } = useAuth();
    const hasConnected = useRef(false);

    useEffect(() => {
        logger.debug("useWebsocketConnection.js [WS] hook -> token:", !!accessToken)
        if (!accessToken || hasConnected.current) return;

        logger.info("useWebsocketConnection.js -> try to connect to with token [WS]")
        wsService.connect(accessToken);
        hasConnected.current = true;
        return () => {
            logger.info("useWebsocketConnection.js -> disconnecting ws on unmount");
            wsService.disconnect();
            hasConnected.current = false;
        };
    }, [accessToken])
}