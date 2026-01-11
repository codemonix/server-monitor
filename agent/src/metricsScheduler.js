import { cfg } from "./config.js";
import { collectSystemMetrics } from "./metricsCollector.js";
import { sendMetricsPayload, drainQueue } from "./transport.js";
import { loadTokenFile } from "./tokenStore.js";


let intervalId = null;

export async function startScheduler() {
    await doCollectSend();

    intervalId = setInterval( async () => {
        await doCollectSend();
    }, cfg.collectInterval);
    console.info(`metricsScheduler.js -> Metrics scheduler started (interval: ${cfg.collectInterval} ms)`);
}

export async function sotopScheduler() {
    if ( intervalId ) clearInterval(intervalId);
}


async function doCollectSend() {
    try {
        const tokenData = await loadTokenFile();
        // console.info("metricsScheduler.js -> doCollectSend, tokenData:", tokenData);
        const agentId = tokenData?.agentId || null;
        const metrics = await collectSystemMetrics();
        const payload = { agentId, ...metrics };

        const res = await sendMetricsPayload(payload);
        console.info("metricsScheduler.js -> metrics send via:", res.via);
        if (res.via === "http" || res.via === "ws") {
            await drainQueue();
        }
    } catch (error) {
        console.error("metricsScheduler.js -> Error in doCollectSend:", error.message);
    }
}