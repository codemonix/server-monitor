import axios from "axios";

const API_BASE = (window?.config?.API_BASE || import.meta.env.VITE_API_BASE || 'http://localhost:4000');

const api = axios.create({ baseURL: `${API_BASE}/api` });

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