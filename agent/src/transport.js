import { sendPayload as wsSend, isConnected } from "./wsClient.js";
import api from "./api.js";
import { enqueueItem, queueSize, peekItem, dequeueItem } from "./diskQueue.js";
import { cfg } from "./config.js";
import { loadTokenFile } from "./tokenStore.js";

const queueMaxFiles = cfg.diskQueueMaxFiles || 100;


export async function sendMetricsPayload(payload) {
    // payload should include agentId, ts, metrics...
    // 1) Try send over WS
    console.info(" transport.js -> sendMetricsPayload , Attempting to send metrics payload", payload);
    console.info(" transport.js -> sendMetricsPayload , Checking WebSocket connection", isConnected());
    if ( isConnected() ) {
        console.info(" transport.js -> sendMetricsPayload , Sending payload over WebSocket");
        payload.type = "metrics";
        const ok = wsSend(payload);
        if ( ok ) {
            return { via: 'ws' };
        } else {
            console.warn(" transport.js -> sendMetricsPayload , WebSocket send failed");
        }
    }
        // 2) Try send over HTTP API
    try {
        await api.post('/metrics/points', payload);
        return { via: 'http' };
    } catch (error) {
        console.warn(" transport.js -> sendMetricsPayload , HTTP send failed:", error.message);
        try {
            const qSize = await queueSize();
            console.info(" transport.js -> sendMetricsPayload , Queue size:", qSize);
            if ( qSize >= queueMaxFiles ) {
                console.warn(" transport.js -> sendMetricsPayload , Queue is full")
                return { via: null };
            }
            await enqueueItem(payload);
            return { via: 'queued' };
        } catch (qError) {
            console.error(" transport.js -> sendMetricsPayload , Queueing failed:", qError.message);
        }
        return { via: null };
    }
}

export async function drainQueue() {
    // try to send queued items FIFO untill empty or failure
    let size = await queueSize();
    console.info(` transport.js -> drainQueue , Starting to drain queue, ${size} items pending`);
    while ( size > 0 ) {
        const peek = await peekItem();
        if ( !peek ) break;
        try {
            await api.post('/metrics/points', peek.data);
            await dequeueItem();
            console.info(" transport.js -> drainQueue , Queued item sent and removed from queue");
        } catch (error) {
            console.warn(" transport.js -> drainQueue , Sending queued item failed, stopping drain:", error.message);
            break;
        }

        size = await queueSize();
    }
    console.info(` transport.js -> drainQueue , Queue drain complete, ${size} items remaining`);
}