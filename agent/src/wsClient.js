import WebSocket from "ws";
import { cfg } from "./config.js";
import { loadTokenFile, getTokenSync } from "./tokenStore.js";


let ws = null;
let reconnectAttempts = 0;
let manualClose = false;

const MAX_RETRIES = 10;


function backoffMs() {
    const base = cfg.wsReconnectBaseMs || 2000;
    const max = 60_000;

    // exponential backoff with jitter
    const exp = Math.min(max, base * Math.pow(2, Math.min(10, reconnectAttempts)));
    const jitter = Math.floor(Math.random() * base);
    return exp + jitter;
}

export async function connectWs() {
    manualClose = false;
    const tokenData = getTokenSync() || (await loadTokenFile());
    if (!tokenData?.accessToken) throw new Error("wsClient.js -> No access token available for WebSocket connection");

    const headers = { 
        Authorization: `Bearer ${tokenData.accessToken}`,
        'X-Role': 'agent',
        'X-Agent-Id': tokenData.agentId,
    };
    
    const url = `${cfg.wsUrl}`;

    console.info("wsClient.js -> connecting to WebSocket at", url);
    ws = new WebSocket(url, { headers });

    ws.on('open', () => {
        try {
            ws.send(JSON.stringify({ type: 'auth', token: tokenData.accessToken, role: 'agent' }));
        } catch (error) {
            console.log("wsClient.js -> error sending auth message:", error.message)
        }
        console.info(" wsClient.js -> WebSocket connection established");
        reconnectAttempts = 0;
    });

    ws.on('close', ( code, reson ) =>{
        console.warn(" wsClient.js -> WebSocket closed:", "code:", code, "reason:", reson);
        if (!manualClose) {
            console.info(" wsClient.js -> WebSocket closed, scheduling reconnect");
            scheduleReconnect();
        }
    })

    ws.on('error', (error) => {
        console.error("wsClient.js -> WebSocket error:", error.message);
    });

    return ws;
}

function scheduleReconnect() {
    if ( ws && ws.readyState === WebSocket.OPEN) {
        console.info(" Reconnect aborted, already connected")
        return;
    }

    if ( reconnectAttempts >= MAX_RETRIES ) {
        console.error(`wsClient.js -> Max reconnect attempts reached (${MAX_RETRIES}), aborting reconnect`);
        return;
    }

    reconnectAttempts++;
    const ms = backoffMs();
    console.info(` wsClient.js -> scheduling WebSocket reconnect in ${ms} ms (attempt ${reconnectAttempts})`);
    setTimeout(async () => {
        try {
            await connectWs();
        } catch (error) {
            console.warn(" wsClient.js -> WebSocket reconnect failed:", error.message);
            scheduleReconnect();
        }
    }, ms);
}

export function isConnected() {
    console.info(" wsClient.js -> isConnected check", (ws && ws.readyState === WebSocket.OPEN));
    return ws && ws.readyState === WebSocket.OPEN;
}

export function sendPayload(payload) {
    if ( !isConnected() ) return false;
    try {
        ws.send(JSON.stringify(payload));
        // console.info(" wsClient.js -> payload sent over WebSocket:", payload);
        return true;
    } catch (error) {
        console.warn(" wsClient.js -> error sending payload over WebSocket:", error.message);
        return false;
    }
}

export async function closeWs() {
    manualClose = true;
    if ( ws ) {
        try { ws.close(); } catch {};
        ws = null;
    }
}