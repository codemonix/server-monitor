import dotenv from 'dotenv';
import os from'os';

dotenv.config();

function parseTags(raw) {
    if (!raw) return {};
    return Object.fromEntries(
        raw.split(',').map(kv => {
            const [k, ...rest] = kv.split(':');
            return [k.trim(), rest.join(':').trim()];
        })
    );
}

export const cfg = {
  backendBaseUrl: process.env.BACKEND_BASE_URL,
  enrollmentKey: process.env.AGENT_ENROLLMENT_KEY,
  agentName: process.env.AGENT_NAME || os.hostname(),
  pollIntervalMs: parseInt(process.env.POLL_INTERVAL_MS || '5000', 10),
  batchMaxItems: parseInt(process.env.BATCH_MAX_ITEMS || '10', 10),
  batchMaxAgeMs: parseInt(process.env.BATCH_MAX_AGE_MS || '3000', 10),
  diskQueueEnabled: (process.env.DISK_QUEUE_ENABLED || 'true').toLowerCase() === 'true',
  diskQueueDir: process.env.DISK_QUEUE_DIR || './data-queue',
  tags: parseTags(process.env.TAGS)
};

if (!cfg.backendBaseUrl) throw Error('BACKEND_BASE_URL is required');
if (!cfg.enrollmentKey) throw Error('AGENT_ENROLLMENT_KEY is required');