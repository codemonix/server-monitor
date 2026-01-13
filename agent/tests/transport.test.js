import { describe, it, expect, vi, beforeEach } from 'vitest';

// Define mocks
const mocks = vi.hoisted(() => ({
    mockWsSend: vi.fn(),
    mockIsConnected: vi.fn(),
    mockApiPost: vi.fn(),
    mockEnqueueItem: vi.fn(),
    mockQueueSize: vi.fn(),
    mockPeekItem: vi.fn(),
    mockDequeueItem: vi.fn(),
}));

const {
    mockWsSend,
    mockIsConnected,
    mockApiPost,
    mockEnqueueItem,
    mockQueueSize,
    mockPeekItem,
    mockDequeueItem
} = mocks;

vi.mock('../src/wsClient.js', () => ({
    sendPayload: mocks.mockWsSend,
    isConnected: mocks.mockIsConnected
}));

vi.mock('../src/api.js', () => ({
    default: {
        post: mocks.mockApiPost
    }
}));

vi.mock('../src/diskQueue.js', () => ({
    enqueueItem: mocks.mockEnqueueItem,
    queueSize: mocks.mockQueueSize,
    peekItem: mocks.mockPeekItem,
    dequeueItem: mocks.mockDequeueItem
}));

vi.mock('../src/config.js', () => ({
    cfg: {
        diskQueueMaxFiles: 5
    }
}));

vi.mock('../src/tokenStore.js', () => ({
    loadTokenFile: vi.fn()
}));

// Import SUT
import { sendMetricsPayload, drainQueue } from '../src/transport.js';

describe('transport', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Default behavior: WS connected, API works, Queue empty
        mockIsConnected.mockReturnValue(true);
        mockWsSend.mockReturnValue(true);
        mockApiPost.mockResolvedValue({});
        mockQueueSize.mockResolvedValue(0);
    });

    describe('sendMetricsPayload', () => {
        it('should send via WebSocket when connected', async () => {
            const payload = { id: 1 };
            const result = await sendMetricsPayload(payload);

            expect(mockIsConnected).toHaveBeenCalled();
            expect(mockWsSend).toHaveBeenCalledWith(expect.objectContaining({ id: 1, type: 'metrics' }));
            expect(result).toEqual({ via: 'ws' });
            expect(mockApiPost).not.toHaveBeenCalled();
        });

        it('should fallback to HTTP when WebSocket is disconnected', async () => {
            mockIsConnected.mockReturnValue(false);
            const payload = { id: 1 };
            
            const result = await sendMetricsPayload(payload);

            expect(mockWsSend).not.toHaveBeenCalled();
            expect(mockApiPost).toHaveBeenCalledWith('/metrics/points', payload);
            expect(result).toEqual({ via: 'http' });
        });

        it('should fallback to HTTP when WebSocket send fails', async () => {
            mockIsConnected.mockReturnValue(true);
            mockWsSend.mockReturnValue(false); // Send failed
            const payload = { id: 1 };

            const result = await sendMetricsPayload(payload);

            expect(mockApiPost).toHaveBeenCalledWith('/metrics/points', expect.objectContaining({ id: 1 }));
            expect(result).toEqual({ via: 'http' });
        });

        it('should queue payload when HTTP fails and queue is not full', async () => {
            mockIsConnected.mockReturnValue(false);
            mockApiPost.mockRejectedValue(new Error('Network Error'));
            mockQueueSize.mockResolvedValue(2); // Less than max (5)
            
            const payload = { id: 1 };
            const result = await sendMetricsPayload(payload);

            expect(mockEnqueueItem).toHaveBeenCalledWith(payload);
            expect(result).toEqual({ via: 'queued' });
        });

        it('should drop payload when HTTP fails and queue is full', async () => {
            mockIsConnected.mockReturnValue(false);
            mockApiPost.mockRejectedValue(new Error('Network Error'));
            mockQueueSize.mockResolvedValue(5); // Equal to max
            
            const payload = { id: 1 };
            const result = await sendMetricsPayload(payload);

            expect(mockEnqueueItem).not.toHaveBeenCalled();
            expect(result).toEqual({ via: null });
        });

        it('should return null via when queueing throws error', async () => {
            mockIsConnected.mockReturnValue(false);
            mockApiPost.mockRejectedValue(new Error('Network Error'));
            mockQueueSize.mockResolvedValue(0);
            mockEnqueueItem.mockRejectedValue(new Error('Disk Error'));

            const payload = { id: 1 };
            const result = await sendMetricsPayload(payload);

            expect(result).toEqual({ via: null });
        });
    });

    describe('drainQueue', () => {
        it('should do nothing if queue is empty', async () => {
            mockQueueSize.mockResolvedValue(0);
            await drainQueue();
            expect(mockPeekItem).not.toHaveBeenCalled();
        });

        it('should process items until queue is empty', async () => {
            mockQueueSize
                .mockResolvedValueOnce(2)
                .mockResolvedValueOnce(1)
                .mockResolvedValueOnce(0);
            
            mockPeekItem
                .mockResolvedValueOnce({ data: { id: 1 } })
                .mockResolvedValueOnce({ data: { id: 2 } });

            await drainQueue();

            expect(mockApiPost).toHaveBeenCalledTimes(2);
            expect(mockApiPost).toHaveBeenNthCalledWith(1, '/metrics/points', { id: 1 });
            expect(mockApiPost).toHaveBeenNthCalledWith(2, '/metrics/points', { id: 2 });
            expect(mockDequeueItem).toHaveBeenCalledTimes(2);
        });

        it('should stop draining if API call fails', async () => {
            mockQueueSize.mockResolvedValue(1);
            mockPeekItem.mockResolvedValue({ data: { id: 1 } });
            mockApiPost.mockRejectedValue(new Error('API Error'));

            await drainQueue();

            expect(mockApiPost).toHaveBeenCalledTimes(1);
            expect(mockDequeueItem).not.toHaveBeenCalled();
        });

        it('should stop draining if peek returns null', async () => {
            mockQueueSize.mockResolvedValue(1);
            mockPeekItem.mockResolvedValue(null);

            await drainQueue();

            expect(mockApiPost).not.toHaveBeenCalled();
        });
    });
});
