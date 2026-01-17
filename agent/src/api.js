import axios from 'axios';
import { cfg } from './config.js';
import { loadTokenFile, getTokenSync } from './tokenStore.js';


const api = axios.create({
    baseURL: cfg.backendBaseUrl,
    headers: { 'Content-Type': 'application/json' },
    timeout: 5000,
});

api.interceptors.request.use(async (config) => {
    const token = getTokenSync() || (await loadTokenFile());

    if (!token) {
        console.warn("api.js -> No token available, proceeding without authentication");
        return config
    }

    if (config._useRefreshToken && token?.refreshToken) {
        // console.info("api.js -> attaching refresh token", token.refreshToken);
        config.headers.Authorization = `Bearer ${token.refreshToken}`;
    } else if (token?.accessToken) {
        console.log("api.js -> attaching access token to request", token?.accessToken);
        if (token?.accessToken) config.headers.Authorization = `Bearer ${token.accessToken}`;
    } else {
        console.warn("api.js -> no access token found, not attaching to request");
    
    }
    return config;
});

export default api;