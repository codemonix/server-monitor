// Converts outline raw data to structured stats (mock implementation)

import { fetchAccessKeys } from "./outlineAPI.service.js";

export async function getOutlineStats() {
    const keys = fetchAccessKeys();
    return {
        totalUsers: keys.length,
        users: keys.map( (k) => ({ id: k.id, name: k.name, usedBytes: Math.floor(Math.random() * 1e8 ), 
            activeConnections: Math.floor(Math.random() * 3) }))
    };
}