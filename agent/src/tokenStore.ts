import path from "path";
import fs from "fs/promises";
import { atomicWrite } from "./utils/atomicWrite.js";
import { cfg } from "./config.js";

export type AgentTokenState = {
    agentId?: string;
    accessToken?: string;
    refreshToken?: string;
    issuedAt?: string;
    expiresAt?: string | null;
    config?: { pollIntervalMs?: number; batchMaxItems?: number } & Record<string, unknown>;
    lastSeen?: unknown;
    lastSavedAt?: string;
    lastRefreshAt?: string;
} | null;

const stateFilePath = path.join(cfg.dataDir, cfg.tokenFile);

let cache: AgentTokenState = null;

export async function ensureDataDir() {
    await fs.mkdir(cfg.dataDir, { recursive: true });
}

export async function saveTokenFile(tokenObj: NonNullable<AgentTokenState>) {
    console.info("tokenStore.js -> saveTokenfile -> tokenObj:", tokenObj);
    await ensureDataDir();
    const payload = Object.assign({}, tokenObj, { lastSavedAt: new Date().toISOString() });
    await atomicWrite(stateFilePath, JSON.stringify(payload, null, 2), {
        encoding: "utf8",
        mode: 0o600,
    });
    cache = payload;
    console.log("Token data saved to state file");
    return payload;
}

export async function loadTokenFile(): Promise<AgentTokenState> {
    if (cache) {
        console.log("Token data loaded from cache");
        return cache;
    }

    try {
        console.info("tokenStore,js -> loadTokenFile stateFilePath:", stateFilePath);
        const raw = await fs.readFile(stateFilePath, "utf8");

        if (!raw || raw.trim() === "") {
            console.warn("tokenStore -> token state file is empty");
            cache = null;
            return null;
        }

        cache = JSON.parse(raw) as NonNullable<AgentTokenState>;
        console.log("Token data loaded from state file");
        return cache;
    } catch (error: any) {
        if (error.code === "ENOENT") {
            console.warn("tokenStore -> no token state file found", error.message);
            cache = null;
            return null;
        }

        if (error instanceof SyntaxError) {
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
    } catch (erroe: any) {
        if (erroe.code === "ENOENT") console.warn("No token state file to clear");
    }
}

export async function updateTokenFile(updates: Partial<NonNullable<AgentTokenState>>) {
    const current = (await loadTokenFile()) || {};
    const merged = { ...current, ...updates };
    return saveTokenFile(merged as NonNullable<AgentTokenState>);
}

export function getTokenSync(): AgentTokenState {
    return cache;
}
