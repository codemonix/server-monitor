// import { cfg } from "./config.js";
import { ensureAuthenticated, refreshToken, enrollAgent } from "./auth.js";
import { connectWs, closeWs } from "./wsClient.js";
import { startScheduler, stopScheduler } from "./metricsScheduler.js";
import { cfg } from "./config.js";


function start() {

    console.log(`[Init] Starting SRM Agent v${cfg.agentVersion}`);
    console.log(`[Init] Config Path: ${cfg.configPath}`);

    if (!cfg.isValid) {
        console.warn("===================================================");
        console.warn(" [ATTENTION] AGENT NOT CONFIGURED ");
        console.warn("===================================================");
        console.warn(` Missing 'backendBaseUrl' or 'enrollmentKey'.`);
        console.warn(` Please edit: ${cfg.configPath}`);
        console.warn(" The agent will retry in 30 seconds...");

        setTimeout(() => {
            // TODO: hot reload config and restart agent
            process.exit(1);
        }, 30000);
        return;
    }
    console.log(`[Init] Config valid. Backend: ${cfg.backendBaseUrl}`);
    console.log(`[Init] Data Directory: ${cfg.dataDir}`);

    startAgent().catch(err => {
        console.error("index.js -> Fatal error during agent start:", err.message);
        process.exit(1);
    });
}

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

    const runRefreshLoop = async () => {
        try {
            console.info("index.js -> Refreshing access token...");
            const result = await refreshToken();

            // Restart Shcheduler if new Config
            if (result.configChanged) {
                console.info("index.js -> Config change detected, restarting scheduler...");
                await startScheduler();
            }
        } catch (error) {
            console.warn("index.js -> Token refresh failed:", error.message);
        }
    }

    // schedule token refresh
    setInterval( runRefreshLoop, 10 * 60 * 1000); // every 10 minutes
}

async function gracefulShutdown() {
    console.info("index.js -> Shutting down agent...");
    try { await stopScheduler(); } catch {};
    try { await closeWs(); } catch {};
    process.exit(0);
}

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);


try {
    start();
} catch (error) {
    console.error("index.js -> Fatal error during agent start:", error.message);
    process.exit(1);
}