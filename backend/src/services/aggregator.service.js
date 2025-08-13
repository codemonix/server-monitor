import { getOutlineStats } from "./outlineStats.service.js";
import { getSystemMetrics } from "./systemMetrics.service.js";
import { getNetworkStats } from "./networkStats.service.js";
import { getTopProcesses } from "./processMonitor.service.js";


export async function getAllStats() {
    const [ outline, system, network, processes ] = await Promise.all([
        getOutlineStats(),
        getSystemMetrics(),
        getNetworkStats(),
        getTopProcesses()
    ]);

    return { system, network, outline, processes };
}