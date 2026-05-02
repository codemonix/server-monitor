import store from "../redux/store.js";
import { updateMetrics } from "../redux/slices/metricSlice.js";
import { logger } from "../utils/log.js";
import { updateServerDetailMetric } from "../redux/slices/serverDetailsSlice.js";

const WS_URL = window?.config?.WS_BASE_URL || import.meta.env.VITE_WS_URL;

class WebSocketService {
    socket: WebSocket | null = null;
    reconnectInterval = 5000;
    authenticated = false;
    token: string | null = null;
    messageQueue: unknown[] = [];
    isConnecting = false;

    connect(token: string) {
        logger.info("dashboard try to connect");
        if (
            this.socket?.readyState === WebSocket.OPEN ||
            this.socket?.readyState === WebSocket.CONNECTING ||
            this.isConnecting
        ) {
            logger.warn("webSocketService.js -> connect -> WebSocket already connected.");
            return;
        }

        this.isConnecting = true;
        this.token = token;
        logger.debug("webSocketService.js -> connect -> WS_URL:", WS_URL);
        this.socket = new WebSocket(WS_URL);

        this.socket.onopen = () => {
            logger.info("webSocketService.js -> opeening ws connection");
            this.isConnecting = false;
            this.send({ type: "auth", token, role: "dashboard" });
            logger.debug("webSocketSrvice.js -> auth message sent:", !!token);

            this.flushMessageQueue();
        };

        this.socket.onmessage = (event) => {
            logger.debug("webSocketService.js -> message received:", !!event.data);
            const msg = JSON.parse(event.data);

            if (msg.type === "auth_success") {
                this.authenticated = true;
                logger.info("[WS] webSocketService.js -> authenticated");
                return;
            }

            if (msg.type === "metricUpdate") {
                const { agentId, payload } = msg;

                logger.info("[WS] webSocketService.js -> metricUpdate -> agentId:", agentId);

                const { lastLoadedServerId } = store.getState().serverDetails;
                if (lastLoadedServerId === agentId) {
                    logger.debug("[WS] websocketService.js -> update selected server:", agentId);
                    store.dispatch(
                        updateServerDetailMetric({
                            agentId,
                            ...payload,
                        })
                    );
                } else {
                    logger.warn("[WS] webSocketService.js -> updateServerDetail skipped!");
                }
                logger.debug("[WS] webSocketService.js -> metricUpdate received:", msg);
                store.dispatch(updateMetrics({ ...msg.payload }));
            }
        };

        this.socket.onclose = (event) => {
            logger.warn("[WS] webSocketService.js -> disconnected:", event);
            this.authenticated = false;
            this.isConnecting = false;
        };

        this.socket.onerror = (error) => {
            logger.error("[WS] Error:", error);
            this.isConnecting = false;
            this.socket?.close();
        };
    }

    reconnect() {
        if (this.token && (!this.socket || this.socket.readyState === WebSocket.CLOSED)) {
            logger.info("Reconnecting WebSocket...");
            this.connect(this.token);
        }
    }

    disconnect() {
        if (this.socket) {
            logger.debug("webSocketService.js -> disconnect called ...");
            this.socket.close(1000, "Manual close");
            this.socket = null;
            this.authenticated = false;
            this.messageQueue = [];
            this.isConnecting = false;
        }
    }

    send(data: unknown) {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify(data));
            logger.debug("webSocketService.js -> sent auth message:", (data as { type?: string }).type);
        } else {
            logger.warn(
                "Canot send data, connection error.",
                this.socket ? this.socket.readyState : "no socket"
            );
        }
    }

    flushMessageQueue() {
        if (this.messageQueue.length === 0) return;
        logger.info("Flushing message queue:", this.messageQueue.length);
        while (this.messageQueue.length > 0) {
            const msg = this.messageQueue.shift();
            if (this.socket && this.socket.readyState === WebSocket.OPEN) {
                this.socket.send(JSON.stringify(msg));
                logger.info("Sent queued message:", (msg as { type?: string }).type);
            }
        }
    }

    isConnected() {
        return this.socket && this.socket.readyState === WebSocket.OPEN;
    }

    getReabyState() {
        if (!this.socket) return null;
        const states = ["CONNECTING", "OPEN", "CLOSING", "CLOSED"];
        return states[this.socket.readyState] || "UNKNOWN";
    }
}

const wsService = new WebSocketService();
export default wsService;
