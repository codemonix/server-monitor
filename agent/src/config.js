import dotenv from 'dotenv';
import os from'os';
import fs from 'fs';
import path from 'path';


dotenv.config();


const isWin = process.platform === 'win32';
// const isDev = process.env.NODE_ENV !== 'production';

const DFAULT_PLATFOR_DIR = isWin
    ? 'C:\\ProgramData\\srm-agent'
    : '/var/lib/srm-agent';

const CONFIG_PATH = isWin 
    ? 'C:\\ProgramData\\srm-agent\\config.json' 
    : '/etc/srm-agent/config.json';
const PLACEHOLDER_URL = "https://your-backend-url.com/";
const PLACEHOLDER_KEY = "your-enrollment-key";

let fileCfg = {};
// Load config 
if (fs.existsSync(CONFIG_PATH)) {
    try {
        fileCfg = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'));
    } catch (e) {
        console.error('config.js -> Error loading config file(config.json):', e.message); 
    }
}
// Read Version
function getVersion() {
    try {
        return fs.readFileSync(path.join(process.cwd(), 'version.txt'), 'utf-8').trim();
    } catch {
        return '0.0.0-dev';
    }
}

const resolvedBackendUrl = process.env.BACKEND_BASE_URL || fileCfg.backendBaseUrl || PLACEHOLDER_URL;
const resolvedEnrollmentKey = process.env.AGENT_ENROLLMENT_KEY || fileCfg.enrollmentKey || PLACEHOLDER_KEY;
const resolvedDataDir = process.env.DATA_DIR || fileCfg.dataDir || DFAULT_PLATFOR_DIR;

const isBackendUrlValid = resolvedBackendUrl && resolvedBackendUrl !== PLACEHOLDER_URL;
const isEnrollmentKeyValid = resolvedEnrollmentKey && resolvedEnrollmentKey !== PLACEHOLDER_KEY;

export const cfg = {
    isValid: isBackendUrlValid && isEnrollmentKeyValid,

    agentVersion: getVersion(),
    configPath: CONFIG_PATH,

    // Settings
    backendBaseUrl: resolvedBackendUrl,
    enrollmentKey: resolvedEnrollmentKey,
    agentName: process.env.AGENT_NAME || fileCfg.agentName || os.hostname(),

    // Paths
    dataDir: resolvedDataDir,
    tokenFile: 'agent_token.json',

    // Other settings
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
