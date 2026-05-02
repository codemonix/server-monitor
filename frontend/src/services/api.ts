import axios from "axios";
import { getAccessToken } from "../context/tokenManager.js";
import { logger } from "../utils/log.js";

const API_BASE = (window?.config?.API_BASE_URL || import.meta.env.VITE_API_BASE);

logger.debug("api.js -> API_BASE:", API_BASE);


const api = axios.create({ 
    baseURL: `${API_BASE}/api`,
    withCredentials: true,
    headers: { 'Content-Type' : 'application/json'},
});
api.interceptors.request.use((config) => {
    const { token } = getAccessToken();
    if (token) {
        // Axios headers can be either AxiosHeaders (has .set) or a plain object
        const h: any = config.headers;
        if (h && typeof h.set === "function") {
            h.set("Authorization", `Bearer ${token}`);
        } else {
            config.headers = { ...(h || {}), Authorization: `Bearer ${token}` };
        }
    }
    return config;
});

export async function listServers() {
    const { data } = await api.get('/servers');
    return data || [];
}

export async function getServerSummery(id) {
    const { data } = await api.get(`/servers/${id}/summery`);
    return data ;
}

export async function getServerMetrics( id, sinceTs = 0 ) {
    const { data } = await api.get(`/servers/${id}/metrics`, { params: { since: sinceTs || 0 } });
    return data || [];
}

export function setAuthToken(token) {
    if (token) api.defaults.headers.common['Authorization'] = `Bearer ${token}`
    else delete api.defaults.headers.common['Authorization']
}

export default api