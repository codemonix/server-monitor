import path from 'path';
import fs from 'fs/promises';
import { atomicWrite } from './utils/atomicWrite.js';
import { cfg } from './config.js';

const queueDir = path.join(cfg.dataDir, cfg.diskQueueDir);



async function ensureQueueDir() {
    console.info("diskQueue.js -> Queue path:", queueDir);
    await fs.mkdir(queueDir, { recursive: true });
}

function pad(n) {
    return String(n).padStart(12, '0');
}

export async function enqueueItem(item) {
    await ensureQueueDir();
    let files;
    try {
        files = await fs.readdir(queueDir);
        console.log("diskQueue.js -> ensureQueueDir -> files:",files);
    } catch (error) {
        files = [];
        console.warn("diskQueue.js -> enqueueItem , Error reading queue directory:", error.message);
    }
        
    let next = files.length ? Number(files.sort()[files.length - 1 ].slice(0, 12)) + 1 : 1;

    //unique name
    const file = path.join(queueDir, `${pad(next)}.json`);
    try {
        await atomicWrite(file, JSON.stringify(item, null, 2));
    } catch (error) {
        console.error("diskQueue.js -> enqueueItem -> atomicWrite failed", error.message)
        throw new Error("enqueueIten failed to write to disk.")
    }
    console.info(`diskQueue.js -> enqueueItem , Item enqueued to disk queue: ${file}`);
}

export async function peekItem() {
    let files;
    try {
        files = await fs.readdir(queueDir);
    } catch (error) {
        files = [];
        console.warn("diskQueue.js -> peekItem , Error reading queue directory:", error.message);
    }
    const jsons = files.filter( f => f.endsWith('.json')).sort();
    if ( !jsons.length ) return null;
    const file = path.join(queueDir, jsons[0]);
    const raw = await fs.readFile(file, 'utf8');
    return { file, data: JSON.parse(raw) };
}

export async function dequeueItem() {
    const item = await peekItem();
    if ( !item ) return null;
    try {
        await fs.unlink(item.file);
        console.info(`diskQueue.js -> dequeueItem , Item dequeued and file removed: ${item.file}`);
        return item.data;
    } catch (error) {
        console.error("diskQueue.js -> dequeueItem , Error removing dequeued item file:", error.message);
        return null;
    }
}

export async function queueSize() {
    let files;
    try {
        files = await fs.readdir(queueDir);
    } catch (error) {
        files = [];
        console.warn("diskQueue.js -> queueSize , Error reading queue directory:", error.message);
        return null;
    }
    return files.filter( f => f.endsWith('.json')).length;
}

