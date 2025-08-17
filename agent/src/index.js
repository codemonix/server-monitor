import { startScheduler } from "./services/scheduler.js";
import { ensureAuth } from "./services/transport.js";

(async () => {
    try {
        await ensureAuth(); 
        const ctl = startScheduler();
        // manual flush on startup
        setTimeout(() => ctl.flushNow(), 1000);
        console.log('Server monitor agent started');
    } catch (error) {
        console.error('Agent failed to start:', error.message);
        process.exit(1);
    }
})();