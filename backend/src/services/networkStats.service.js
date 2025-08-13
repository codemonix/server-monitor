import fs from 'fs/promises';
import logger from '../utils/logger.js';
import { totalmem } from 'os';

export async function getNetworkStats() {
    // Simple read of /proc/net/dev for linux
    try {
        const data = await fs.readFile('/proc/dev/net', 'utf8');
        const lines = data.split('\n').slice(2).filter(Boolean);
        const interfaces = lines.map((l) => {
            const parts = l.trim().split(/\s+/);
            return { iface: parts[0].replace(':', ''), rx: Number(parts[1]), tx: Number(parts[9]) };
        });
        const totalIn = interfaces.reduce(( s, i ) => s + i.rx, 0 );
        const totalOut = interfaces.reduce(( s, i ) => s + i.tx, 0 );
        return { interfaces, totalIn, totalOut, activeConnections: null };
    } catch (error) {
        logger.error("not e linux environment or permission issue:", error.message);
        return { interfaces: [], totalIn: 0, totalOut: 0, activeConnections: null };
    }
}

