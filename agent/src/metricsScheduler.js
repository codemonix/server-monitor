import { cfg } from "./config.js";
import { collectSystemMetrics } from "./metricsCollector.js";
import { sendMetricsPayload, drainQueue } from "./transport.js";
import { loadTokenFile } from "./tokenStore.js";



let intervalId = null;

export async function startScheduler(intervalMs) {
    let effectiveInterval = intervalMs || cfg.collectInterval;
    
    const tokenData = await loadTokenFile();
    if ( tokenData?.config?.pollIntervalMs ) {
        effectiveInterval = tokenData.config.pollIntervalMs;
    }


    await stopScheduler();
    console.info(`metricsScheduler.js -> Starting metrics scheduler (effective interval: ${effectiveInterval} ms)`)
    
    // await doCollectSend();


    intervalId = setInterval( async () => {
        console.log(`metricsScheduler.js -> setInterval -> collecting metrics every ${effectiveInterval}ms`)
        // console.log(`metricsScheduler.js -> tokenData.config: ${}`)
        console.dir(tokenData, { depth: null, colors: true })
        await doCollectSend();
    }, effectiveInterval);

    // console.info(`metricsScheduler.js -> Metrics scheduler started (interval: ${cfg.collectInterval} ms)`);
}

export async function stopScheduler() {
    if ( intervalId ) {
        clearInterval(intervalId);
        intervalId = null;
    } 
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