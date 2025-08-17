import { collectSnapshot } from "./collector.js";
import { sendBatch } from "./transport.js";
import { MemoryQueue, DiskQueue } from "../utils/queue.js";
import { cfg } from "../config/index.js";

const memQ = new MemoryQueue(2000);
const diskQ = cfg.diskQueueEnabled ? new DiskQueue(cfg.diskQueueDir) : null;

let lastFlush = 0;

async function flush(reson = 'timer') {
    const batch = [];
    batch.push(...memQ.drain(cfg.batchMaxItems - batch.length));
    if (diskQ && batch.length < cfg.batchMaxItems && diskQ.size() > 0) {
        const remaining = cfg.batchMaxItems - batch.length;
        batch.push(...diskQ.drain(remaining));
    }
    if ( batch.length === 0 ) return { sent: 0, reson };

    try {
        await sendBatch(batch);
        lastFlush = Date.now();
        return { sent: batch.length, reson };
    } catch (error) {
        console.error("pushing data failed try disk", error.message);
        batch?.forEach(item => diskQ?.push(item));
        return { send: 0, reson, error: error.message };
    }
}

export function startScheduler() {
    // collector ticker
    setInterval(async () => {
        try {
            const snapshot = await collectSnapshot();
            memQ.push(snapshot);
        } catch ( error ) {
            console.error("pushing snapshot failed, trying to continue ...")
        }
    }, cfg.pollIntervalMs);

    // flush ticker
    setInterval(async () => {
        const age = Date.now() - lastFlush;
        if ( memQ.size() >= cfg.batchMaxItems || age >= cfg.batchMaxAgeMs || (diskQ && diskQ.size() > 0 )) {
            await flush('threshold');
        }
    }, 500);

    return { flushNow: () => flush('manual') };
}
