// import { cfg } from "./config.js";
import { ensureAuthenticated, refreshToken, enrollAgent } from "./auth.js";
import { connectWs, closeWs } from "./wsClient.js";
import { startScheduler, sotopScheduler } from "./metricsScheduler.js";

export async function startAgent() {
    console.info("index.js -> Starting agent...");
    try {
        await ensureAuthenticated();
    } catch (error) {
        console.error("index.js -> Agent authentication failed:", error.message);
        // try enroll agent
        try {
            await enrollAgent();
        } catch (err) {
            console.error("index.js -> Agent enrollment failed:", err.message);
            process.exit(1);
        }
    }

    try {
        await connectWs();
    } catch (error) {
        console.error("index.js -> WebSocket connection failed:", error.message);
    }
    // start metrics scheduler
    await startScheduler();

    // schedule token refresh
    setInterval( async () => {
        try {
            console.info("index.js -> Refreshing access token...");
            await refreshToken();
        } catch (error) {
            console.warn("index.js -> Token refresh failed:", error.message);
            // dont crash, auth module clears token
        }
    }, 10 * 60 * 1000); // every 10 minutes
}

async function gracefulSutdown() {
    console.info("index.js -> Shutting down agent...");
    try { await startScheduler(); } catch {};
    try { await closeWs(); } catch {};
    process.exit(0);
}

process.on('SIGINT', gracefulSutdown);
process.on('SIGTERM', gracefulSutdown);

// Only run when this file is executed directly, not imported
if (import.meta.url === `file://${process.argv[1]}`) {
    startAgent().catch(err => {
        logger.error("agent: fatal error", err.message);
        process.exit(1);
    });
}