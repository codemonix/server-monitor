import  store  from '../redux/store.js';
import { updateMetrics } from '../redux/slices/metricSlice.js';
import { logger } from '../utils/log.js';
import { updateServerDetailMetric } from '../redux/slices/serverDetailsSlice.js';

const WS_URL = window?.config?.WS_BASE_URL || import.meta.env.VITE_WS_URL ;

class WebSocketService {
    constructor () {
        this.socket = null;
        this.reconnectInterval = 5000 // 5 sec.
        this.authenticated = false;
        this.token = null;
        this.messageQueue = [];
        this.isConnecting = false;
    }

    connect (token) {
        console.log("dashboard try to connect")
        if (this.socket?.readyState === WebSocket.OPEN ||
            this.socket?.readyState === WebSocket.CONNECTING ||
            this.isConnecting
        ) {
            console.log("WebSocket already connected.");
            return;
        };

        this.isConnecting = true;
        this.token = token;
        console.log("webSocketService.js -> connect -> WS_URL:", WS_URL);
        this.socket = new WebSocket(WS_URL);

        this.socket.onopen = () => {
            console.log("webSocketService.js -> opeening ws connection");
            this.isConnecting = false;
            this.send({ type: 'auth', token, role: 'dashboard' });
            console.log("webSocketSrvice.js -> auth message sent:", !!token);

            this.flushMessageQueue();
        };

        this.socket.onmessage = (event) => {
            console.log("webSocketService.js -> message received:", event.data);
            const msg = JSON.parse(event.data);

            if (msg.type === 'auth_success') {
                this.authenticated = true;
                logger.info("[WS] webSocketService.js -> authenticated");
                return;
            }

            if (msg.type === 'metricUpdate') {
                const { agentId, payload } = msg;

                console.log("[WS] webSocketService.js -> metricUpdate -> agentId:", agentId)

                const { lastLoadedServerId } = store.getState().serverDetails;
                if ( lastLoadedServerId === agentId ) {
                    console.log("[WS] websocketService.js -> update selected server:", agentId);
                    store.dispatch(updateServerDetailMetric({
                        agentId,
                        ...payload,
                    }))
                } else {
                    console.log("[WS] webSocketService.js -> updateServerDetail skipped!");
                }
                console.log("[WS] webSocketService.js -> metricUpdate received:", msg);
                store.dispatch(updateMetrics({ ...msg.payload }));
                // logger.info("[WS] webSocketService.js -> metricUpdate:", { agentId, payload });
            }
        };

        this.socket.onclose = (event) => {
            console.warn("[WS] webSocketService.js -> disconnected:", event);
            // console.warn("[WS] connection closed, retrying in 5s", event.reason);
            this.authenticated = false;    
            this.isConnecting = false;
            // setTimeout(() => this.reconnect(), this.reconnectInterval);
        };

        this.socket.onerror= (error) => {
            // logger.error("[WS] Error:", error);
            console.error("[WS] Error:", error);
            this.isConnecting = false;
            // this.emit('error', error);
            this.socket.close();
        };
    }

    // onOpen (cb) ( this.litener)

    reconnect () {
        if (this.token && (!this.socket || this.socket.readyState === WebSocket.CLOSED)) {
            console.log("Reconnecting WebSocket...");
            this.connect(this.token);
        }
    }

    disconnect () {
        if (this.socket) {
            console.log("webSocketService.js -> disconnect called ...");
            this.socket.close(1000, "Manual close");
            this.socket = null;
            this.authenticated = false;
            this.messageQueue = [];
            this.isConnecting = false;
        }
    }

    send (data) {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify(data));
            console.log("webSocketService.js -> sent auth message:", data.type);
        } else {
            console.warn("Canot send data, connection error.", this.socket ? this.socket.readyState : 'no socket');
        }
    }

    flushMessageQueue() {
        if ( this.messageQueue.length === 0 ) return;
        console.log("Flushing message queue:", this.messageQueue.length);
        while ( this.messageQueue.length > 0 ) {
            const msg = this.messageQueue.shift();
            if ( this.socket && this.socket.readyState === WebSocket.OPEN ) {
                this.socket.send(JSON.stringify(msg));
                console.log("Sent queued message:", msg.type);
            }
        }
    }

    isConnected() {
        return this.socket && this.socket.readyState === WebSocket.OPEN;
    }

    getReabyState() {
        if (!this.socket) return null;
        const states = ['CONNECTING', 'OPEN', 'CLOSING', 'CLOSED'];
        return states[this.socket.readyState] || 'UNKNOWN';
    }
}

const wsService = new WebSocketService();
export default wsService;