import WebSocket from "ws";
import { cfg } from './config.js';
import { loadTokenFile, getTokenSync } from "./tokenStore.js";


async function testWebSocket() {
    const tokenData = getTokenSync() || ( await loadTokenFile());
    if ( !tokenData.accessToken ) {
        console.error(" XX no access token XX");
        process.exit(1);
    }

    const headers = { 
        Authorization: `Bearer ${tokenData.accessToken}`,
        'X-Role': 'agent',
        'X-Agent-Id': tokenData.agentId,
    };
    const url = cfg.wsUrl;
    console.info(" Testing WebSocket connection to:", url);
    const ws = new WebSocket(url, { headers });
    const startTime = Date.now();

    const timer = setTimeout(() => {
        console.error("Timeout: no respond from server");
        ws.terminate();
        process.exit(1);
    }, 5000 );

    ws.on("open", () => {
        console.log("✅ Connection established successfully!");
        const msg = JSON.stringify({ type: "ping", ts: Date.now() });
        ws.send(msg);
        console.log("ping message sent:", msg)
    });

    ws.on("message", (data) => {
        const msg = JSON.parse(data.toString());
        console.log("📩 Message received:", msg);
        clearTimeout(timer);
        ws.close();
        const elapsed = Date.now() - startTime;
        console.log(`✅ WebSocket test successful (${elapsed}ms)`);
        process.exit(0);
    });

    ws.on("close", (code, reason) => {
        console.log(`❌ Connection closed (code ${code}, reason: ${reason})`);
        clearTimeout(timer);
        process.exit(1);
    });

    ws.on("error", (err) => {
        console.error("💥 WebSocket error:", err.message);
        clearTimeout(timer);
        process.exit(1);
    });    
}

testWebSocket().catch((err) => {
    console.error("Test Script error:", err.message);
    process.exit(1);
})