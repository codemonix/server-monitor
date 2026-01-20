import si from "systeminformation";
import jwt from "jsonwebtoken";
import api from "./api.js";
import { cfg } from "./config.js";
import { loadTokenFile, saveTokenFile, updateTokenFile, clearTokenFile, getTokenSync } from "./tokenStore.js";
import { parseJwtExpSeconds } from "./utils/jwtUtils.js";

let refreshTimer = null;

function scheduleRefresh(accessToken, refreshFn) {
    // parse exp and schedule refresh
    const expSec = parseJwtExpSeconds(accessToken);
    if ( !expSec ) {
        // no exp info 
        const tenMin = 10 * 60 * 1000;
        if ( refreshTimer ) clearTimeout(refreshTimer);
        refreshTimer = setTimeout( refreshFn, tenMin );
        console.warn(" auth.js -> no exp found , access token will be refreshed in 10 minutes");
        return;
    }

    const nowMs = Date.now();
    const expMs = expSec * 1000;
    const msUntilExp = expMs - nowMs;

    // refresh 1 minute before expiry or 75% of lifetime
    const refreshMs = Math.max( 10000, Math.min( msUntilExp * 0.75, msUntilExp - 60000 ));
    if (refreshTimer) clearTimeout(refreshTimer);
    console.info(` auth.js -> scheduling token refresh in ${(refreshMs/1000).toFixed(0)} seconds`);
    refreshTimer = setTimeout( refreshFn, Math.max(1000, Math.floor(refreshMs) ));
}

function isAccessTokenExpired(token) {
    try {
        const decoded = jwt.decode(token);
        return !decoded || (decoded.exp * 1000 < Date.now());
    } catch (error) {
        return true;
    }
}

export async function enrollAgent() {
    if ( !cfg.enrollmentKey ) throw new Error("Enrollment key missing in config");
    console.info(" auth.js -> enrolling agent...");

    const osInfo = await si.osInfo();
    const netInfo = await si.networkInterfaces();
    const cpuInfo = await si.cpu();

    const mainIface = netInfo.find( iface => iface.ip4 && !iface.internal);

    const payload = {
        token: cfg.enrollmentKey,
        name: cfg.agentName,
        host: osInfo.hostname,
        ip: mainIface?.ip4 || 'unknown',
        os: osInfo.distro,
        arch: osInfo.arch || process.arch,
        version: osInfo.release,
        tags: cfg.tags || [],
        cpuModel: cpuInfo.brand,
    };

    console.info(" auth.js -> enrollAgent , Enrolling ... payload:", payload);
    console.log("");
    const data = await api.post('/agents/enroll', payload).then( res => res.data );
    console.log(" auth.js -> enrollAgent , Enrollment response status:", data.status);
    // expected res: { agentId, accessToken, refreshToken, expiresInSeconds?, config? }
    console.log(" auth.js -> enrollAgent , Enrollment response:", data);
    const saved = await saveTokenFile({
        agentId: data.agentId,
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        issuedAt: new Date().toISOString(),
        expiresAt: data.expiresAt || null,
        config: data.config || {}, 
    });

    console.info(" auth.js -> enrollAgent , Agent enrolled successfully ID:", data.agentId);
    return saved;
}

export async function refreshToken() {
    const tokenData = await loadTokenFile();
    if ( !tokenData?.refreshToken ) throw new Error("No refresh token available");
    console.info(" auth.js -> refreshToken ->  refreshing access token...");
    try {
        const res = await api.post('/agents/refresh-token', undefined, { _useRefreshToken: true, });
        const data = res.data;
        const newConfig = data.config || {};

        const currentPoll = tokenData.config?.pollIntervalMs ;
        const newPoll = newConfig.pollIntervalMs;
        const configChanged = newPoll && currentPoll && ( newPoll !== currentPoll );

        console.log(" auth.js -> refreshToken -> api call -> data:", data)
        
        if (configChanged) console.info(`auth.js -> Config changed: Polling ${currentPoll}ms -> ${newPoll}ms}`);

        console.info("auth.js -> refreshToken -> api call -> data:", data)
        // expected res: { accessToken, refreshToken?, expiresAt?, config? }
        const merged = await updateTokenFile({
            accessToken: data.accessToken,
            refreshToken: data.refreshToken || tokenData.refreshToken,
            expiresAt: data.expiresAt || tokenData.expiresAt,
            lastRefreshAt: new Date().toISOString(),
            config: { ...(tokenData.config || {}), ...(data.config || {}) },
        });
        
        // schedule again 
        scheduleRefresh(merged.accessToken, async () => {
            try { 
                await refreshToken(); 
            } catch (error) {
                console.error(" auth.js -> refreshToken -> error refreshing token:", error.message);
            }
        });
        console.info(" auth.js -> refreshToken -> refreshed successfully");
        return { ...merged, configChanged };
    } catch (error) {
        console.warn(" auth.js -> refreshToken -> token refresh failed:", error.message);
        if ( error.response && error.response.status >= 400 && error.response.status < 500 )  {
            await clearTokenFile();
            console.error(" auth.js -> refreshToken , Refresh token invalid, cleared stored tokens, re-enrollment required");
        }
        throw error; 
    }
}

export async function ensureAuthenticated() {
    let tokenData = await loadTokenFile();
    // console.info(" auth.js -> ensureAuthenticated, tokenData:", tokenData);
    if ( !tokenData ) {
        console.info(" auth.js -> ensureAuthenticated -> No valid access token, enrolling agent...");
        tokenData = await enrollAgent();
        await saveTokenFile(tokenData);
        return tokenData;
    }
    if ( isAccessTokenExpired( tokenData.accessToken )) {
        console.info(" auth.js -> ensureAuthenticated -> Access token expired, refreshing...");
        try {
            tokenData = await refreshToken();
            await saveTokenFile(tokenData);
        } catch (error) {
            console.error(" auth.js -> ensueAuthenticated -> error refreshing token:", error.message);
            tokenData = await enrollAgent();
            if (!tokenData) throw new Error("Re-enrollment failed, cannot obtain access token");
            await saveTokenFile(tokenData);
            console.info(" auth.js -> ensureAuthenticated -> Re-enrollment successful, new access token obtained");
        }
    }

    return tokenData;
}

export function getCachedToken() {
    return getTokenSync();
}

