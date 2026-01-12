import dotenv from 'dotenv';
import os from'os';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isWin = process.platform === 'win32';
const isDev = process.env.NODE_ENV !== 'production';

const DATA_DIR = isWin 
    ? 'C:\\ProgramData\\srm-agent\\data' 
    : '/var/lib/srm-agent/data';

const CONFIG_PATH = isWin 
    ? 'C:\\ProgramData\\srm-agent\\config.json' 
    : '/etc/srm-agent/config.json';

let fileCfg = {};
// Load config 
if (fs.existsSync(CONFIG_PATH)) {
    try {
        fileCfg = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'));
    } catch (e) {
        console.error('Error loading config file(config.json):', e.message); 
    }
}
// Read Version
function getVersion() {
    try {
        return fs.readFileSync(path.join(__dirname, 'version.txt'), 'utf-8').trim();
    } catch {
        return '0.0.0-dev';
    }
}

// function loadConfigFile() {
//     if (!fs.existsSync(CONFIG_PATH)) return {};
//     return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'));
// }

// const fileCfg = loadConfigFile();

// function parseTags(raw) {
//     if (!raw) return [];
//     return raw
//         .split(',')
//         .map(tag => tag.trim())
//         .filter(Boolean);
// }

export const cfg = {
    agentVersion: getVersion(),
    backendBaseUrl: process.env.BACKEND_BASE_URL || fileCfg.backendBaseUrl,
    //   wsBackendUrl: process.env.BACKEND_BASE_URL.replace(/^http/, "ws"),
    enrollmentKey: process.env.AGENT_ENROLLMENT_KEY || fileCfg.enrollmentKey,
    agentName: process.env.AGENT_NAME || fileCfg.agentName || os.hostname(),
    dataDir: process.env.DATA_DIR || DATA_DIR,
    tokenFile: "agent_token.json",
    pollIntervalMs: Number( fileCfg.pollIntervalMs || '5000'),
    batchMaxItems: Number(fileCfg.batchMaxItems || '10'),
    collectInterval: 1000,
    wsUrl: process.env.WS_URL || fileCfg.wsUrl || 'http://localhost:4000/ws/metrics',
    wsReconnectBaseMs: Number(process.env.WS_RECONNECT_BASE_MS || '2000'),
    batchMaxAgeMs: parseInt(process.env.BATCH_MAX_AGE_MS || '3000', 10),
    diskQueueEnabled: (process.env.DISK_QUEUE_ENABLED || 'true').toLowerCase() === 'true',
    diskQueueDir: process.env.DISK_QUEUE_DIR || fileCfg.diskQueueDir || 'data-queue',
    diskQueueMaxFiles: process.env.DISK_QUEUE_MAX_FILES || fileCfg.diskQueueMaxFiles ||100,
    tags: fileCfg.tags || []
};

if (!cfg.backendBaseUrl) throw Error('BACKEND_BASE_URL is required');
if (!cfg.enrollmentKey) throw Error('AGENT_ENROLLMENT_KEY is required');