import { config } from "../config/index.js";

export async function fetchOutlineServerInfo() {
    // TODO: use fetch with config.outlineApiUrl to get outline data
    return { status: 'OK', serverName: 'outline mock' };
}

export async function fetchAccessKeys() {
    return [
        { id: 'key-1', name: 'user-a', createdAt: new Date().toISOString() }
    ];
}
