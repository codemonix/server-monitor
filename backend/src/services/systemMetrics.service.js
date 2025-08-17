import si, { cpu } from 'systeminformation';
import logger from '../utils/logger.js';

export async function getSystemMetrics() {
    try {
        const cpuLoad = await si.currentLoad();
        const mem = await si.mem();
        const fsSize = await si.fsSize();
        const osInfo = await si.time();
    
        const disks = fsSize.map( d => ({ fs: d.fs, type: d.type, size: d.size, used: d.used, use: d.use }));
    
        return {
          cpu: Number(cpuLoad.currentload.toFixed(2)), // percent
          cpuPerCore: cpuLoad.cpus.map(c => Number(c.load.toFixed(2))),
          ram: Number(((mem.used / mem.total) * 100).toFixed(2)),
          ramUsed: mem.used,
          ramTotal: mem.total,
          disks,
          uptime: osInfo.uptime // seconds
        };
    } catch (error) {
        logger.error("cant fetch data mock data returned:", error.message);
        return {
            cpu: 0,
            cpuPerCore: [],
            ram: 0,
            ramUsed: 0,
            ramTotal: 0,
            disks: [],
            uptime: 0
            };
    }

}
