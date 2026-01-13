import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fs from 'fs/promises';
import path from 'path';

const tmpDir = path.join(process.cwd(), 'tmp-test-queue');
const queueSubDir = 'data-queue';
const fullQueuePath = path.join(tmpDir, queueSubDir);

// Mock dependencies
vi.mock('../src/config.js', () => ({
    cfg: {
        dataDir: tmpDir,
        diskQueueDir: queueSubDir,
        diskQueueMaxFiles: 100
    }
}));

vi.mock('../src/utils/atomicWrite.js', () => ({
    atomicWrite: async (file, data) => {
        const fs = await import('fs/promises');
        await fs.writeFile(file, data, 'utf8');
    }
}));

describe('diskQueue', () => {
    let diskQueue;

    beforeEach(async () => {
        vi.resetModules();
        await fs.rm(tmpDir, { recursive: true, force: true });
        diskQueue = await import('../src/diskQueue.js');
    });

    afterEach(async () => {
        await fs.rm(tmpDir, { recursive: true, force: true });
        vi.clearAllMocks();
    });

    it('should return null size when queue directory is missing', async () => {
        expect(await diskQueue.queueSize()).toBeNull();
    });

    it('enqueues and dequeues items FIFO', async () => {
        await diskQueue.enqueueItem({ a: 1 });
        await diskQueue.enqueueItem({ a: 2 });

        expect(await diskQueue.queueSize()).toBe(2);

        const first = await diskQueue.dequeueItem();
        expect(first).toEqual({ a: 1 });

        const second = await diskQueue.dequeueItem();
        expect(second).toEqual({ a: 2 });

        expect(await diskQueue.queueSize()).toBe(0);
    });

    it('peek does not remove item', async () => {
        await diskQueue.enqueueItem({ a: 42 });
        const peek = await diskQueue.peekItem();

        expect(peek.data.a).toBe(42);
        expect(await diskQueue.queueSize()).toBe(1);
    });

    it('should handle complex data types', async () => {
        const data = { foo: 'bar', num: 123, nested: { a: 1 } };
        await diskQueue.enqueueItem(data);
        const result = await diskQueue.dequeueItem();
        expect(result).toEqual(data);
    });

    it('should create queue directory if it does not exist', async () => {
        await diskQueue.enqueueItem({ id: 1 });
        const stats = await fs.stat(fullQueuePath);
        expect(stats.isDirectory()).toBe(true);
    });

    it('should handle file numbering correctly', async () => {
        await diskQueue.enqueueItem({ n: 1 });
        await diskQueue.enqueueItem({ n: 2 });
        
        const files = await fs.readdir(fullQueuePath);
        expect(files).toContain('000000000001.json');
        expect(files).toContain('000000000002.json');
    });
});
