import path from 'path';
import fs from 'fs/promises';
import { atomicWrite } from './utils/atomicWrite.js';
import { cfg } from './config.js';

const stateFilePath = path.join(cfg.dataDir, cfg.tokenFile);
// const dir = path.dirname(stateFilePath);

let cache = null;

export async function ensureDataDir() {
    await fs.mkdir(cfg.dataDir, { recursive: true });
}

export async function saveTokenFile(tokenObj) {
    
    // tokenObj expected shape:
    // { agentId, accessToken, refreshToken, issuedAt, expiresAt (ISO), config: {...}, lastSeen }
    console.info('tokenStore.js -> saveTokenfile -> tokenObj:', tokenObj)
    await ensureDataDir();
    const payload = Object.assign({}, tokenObj, { lastSavedAt: new Date().toISOString() });
    await atomicWrite(stateFilePath, JSON.stringify(payload, null, 2 ), { encoding: "utf8", mode: 0o600 });
    cache = payload;
    console.log("Token data saved to state file");
    return payload;
}

export async function loadTokenFile() {
    if (cache) return cache;
    try {
        console.info('tokenStore,js -> loadTokenFile stateFilePath:', stateFilePath);
        const raw = await fs.readFile(stateFilePath, 'utf8');

        // is the file empty?
        if ( !raw || raw.trim() === '' ) {
            console.warn("tokenStore -> token state file is empty");
            cache = null;
            return null;
        }

        cache = JSON.parse(raw);
        console.log("Token data loaded from state file");
        return cache;
    } catch (error) {
        if ( error.code === 'ENOENT' ){
            console.warn("tokenStore -> no token state file found", error.message);
            cache = null;
            return null;
        };

        if ( error instanceof SyntaxError ) {
            console.error("tokenStore -> token state file is corrupted or invalid JSON:", error.message);
            cache = null;
            return null;
        }

        console.error("tokenStore -> Unexpected error loading token state file:", error.message);
        return null;
    }
}

export async function clearTokenFile() {
    cache = null;
    try {
        await fs.unlink(stateFilePath);
        console.log("Token state file cleared");
    } catch (erroe) {
        if ( erroe.code === 'ENOENT' ) console.warn("No token state file to clear");
    }
}

export async function updateTokenFile(updates) {
    const current = (await loadTokenFile()) || {};
    const merged = { ...current, ...updates };
    return saveTokenFile(merged);
}

export function getTokenSync() {
    return cache;
}