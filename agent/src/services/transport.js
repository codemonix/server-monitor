import axios from "axios";
import { cfg } from '../config/index.js';
import { loadState, saveState } from "../utils/presistance.js";

const api = axios.create({ baseURL: cfg.backendBaseUrl, timeout: 5000 });

async function enroll() {
    const state = loadState();
    if (state.agent && state.token) return state;  //alreadt enrolled
    const payload = {
        name: cfg.agentName,
        enrollmentKey: cfg.enrollmentKey,
        tags: cfg.tags
    };
    const { data } = await api.post('/agents/register', payload);
    const newState = { agent: data.agent, token: data.token };
    saveState(newState);
    return newState;
}

export async function ensureAuth() {
    const state = loadState();
    if (!state.token) return enroll();
    return state;
}

export async function sendBatch(items) {
    const { token, agent } = await ensureAuth();
    const headers = { Authorization: `Bearer ${token}` };
    const payload = { agentId: agent.id, items };
    const { data } = await api.post('/agents/ingest', payload, { headers });
    return data;
}