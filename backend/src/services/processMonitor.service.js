import { exec } from "child_process";
import { promisify } from "util";
import logger from "../utils/logger.js";
const execP =  promisify(exec);

export async function getTopProcesses( limit = 10 ) {
    try {
        const { stdout } = await execP("ps -eo pid,comm,%cpu,%mem --sort=-%cpu | head -n " + (limit + 1));
        const lines = stdout.split('\n').slice(1).filter(Boolean);
        return lines.map((ln) => {
            const parts = ln.trim().split(/\s+/);
            const pid = Number(parts[0]);
            const comm = parts[1];
            const cpu = Number(parts[2]);
            const mem = Number(parts[3]);
            return { pid, name: comm, cpu, mem };
        });
    } catch (error) {
        logger.error("getTopProcesses failed:", error.message);
        return [];
    }
}