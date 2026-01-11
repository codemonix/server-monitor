import dotenv from 'dotenv';
import os from'os';
import fs from 'fs';
import path from 'path';

dotenv.config();

const CONFIG_PATH =
    process.platform === 'win32'
        ? "C:\\ProgramData\\srm-agent\\config.json"
        : "/etc/srm-agent/config.json";

function loadConfigFile() {
    if (!fs.existsSync(CONFIG_PATH)) return {};
    return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'));
}

const fileCfg = loadConfigFile();

function parseTags(raw) {
    if (!raw) return [];
    return raw
        .split(',')
        .map(tag => tag.trim())
        .filter(Boolean);
}

export const cfg = {
    backendBaseUrl: process.env.BACKEND_BASE_URL || fileCfg.backendBaseUrl,
    //   wsBackendUrl: process.env.BACKEND_BASE_URL.replace(/^http/, "ws"),
    enrollmentKey: process.env.AGENT_ENROLLMENT_KEY || fileCfg.enrollmentKey,
    agentName: process.env.AGENT_NAME || fileCfg.agentName || os.hostname(),
    dataDir: process.env.DATA_DIR || './data',
    tokenFile: "agent_token.json",
    pollIntervalMs: Number(fileCfg.pollIntervalMs || '5000'),
    batchMaxItems: Number(fileCfg.batchMaxItems || '10'),
    collectInterval: 1000,
    wsUrl: process.env.WS_URL || fileCfg.wsUrl || 'http://localhost:4000/ws/metrics',
    wsReconnectBaseMs: Number(process.env.WS_RECONNECT_BASE_MS || '2000'),
    batchMaxAgeMs: parseInt(process.env.BATCH_MAX_AGE_MS || '3000', 10),
    diskQueueEnabled: (process.env.DISK_QUEUE_ENABLED || 'true').toLowerCase() === 'true',
    diskQueueDir: process.env.DISK_QUEUE_DIR || 'data-queue',
    diskQueueMaxFiles: process.env.DISK_QUEUE_MAX_FILES || 100,
    tags: fileCfg.tags || []
};

if (!cfg.backendBaseUrl) throw Error('BACKEND_BASE_URL is required');
if (!cfg.enrollmentKey) throw Error('AGENT_ENROLLMENT_KEY is required');