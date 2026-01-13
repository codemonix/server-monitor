import { describe, it, expect, vi, beforeEach, afterAll, beforeAll } from 'vitest';

// Define mocks before imports
vi.mock('systeminformation', () => ({
    default: {
        currentLoad: vi.fn(),
        mem: vi.fn(),
        fsSize: vi.fn(),
        networkStats: vi.fn(),
        time: vi.fn(),
    }
}));

vi.mock('os', () => ({
    default: {
        loadavg: vi.fn(),
    }
}));

describe('metricsCollector', () => {
    let collectSystemMetrics;
    let si;
    let os;
    let dateNowSpy;

    beforeAll(() => {
        // Spy on Date.now to control time in tests
        dateNowSpy = vi.spyOn(Date, 'now');
    });

    afterAll(() => {
        dateNowSpy.mockRestore();
    });

    beforeEach(async () => {
        vi.resetModules(); // Reset cache to ensure fresh state for lastNetworkMetrics
        vi.clearAllMocks();

        // Import modules dynamically to get fresh instances
        si = (await import('systeminformation')).default;
        os = (await import('os')).default;
        const module = await import('../src/metricsCollector.js');
        collectSystemMetrics = module.collectSystemMetrics;
    });

    it('should collect metrics correctly on first run (initial state)', async () => {
        // Setup Mocks
        const mockTime = 1000000;
        dateNowSpy.mockReturnValue(mockTime);

        si.currentLoad.mockResolvedValue({ currentLoad: 50 });
        si.mem.mockResolvedValue({ used: 2048, total: 4096 });
        si.fsSize.mockResolvedValue([{ used: 100, size: 500 }]);
        si.networkStats.mockResolvedValue([{ rx_bytes: 1000, tx_bytes: 1000 }]);
        si.time.mockResolvedValue({ uptime: 12345 });
        os.loadavg.mockReturnValue([1.5, 1.2, 1.0]);

        const metrics = await collectSystemMetrics();

        // Assertions
        expect(metrics).toEqual({
            ts: expect.any(Date),
            cpu: 50,
            memUsed: 2048,
            memTotal: 4096,
            diskUsed: 100,
            diskTotal: 500,
            rx: 0, // First run is always 0
            tx: 0, // First run is always 0
            upTime: 12345,
            load1: 1.5,
            load5: 1.2,
            load15: 1.0,
        });
    });

    it('should calculate network speed correctly on subsequent run', async () => {
        // 1. First Run (Initialize)
        let currentTime = 1000000;
        dateNowSpy.mockReturnValue(currentTime);

        si.currentLoad.mockResolvedValue({ currentLoad: 10 });
        si.mem.mockResolvedValue({ used: 100, total: 200 });
        si.fsSize.mockResolvedValue([{ used: 10, size: 100 }]);
        si.time.mockResolvedValue({ uptime: 100 });
        os.loadavg.mockReturnValue([0, 0, 0]);
        
        // Initial network bytes
        si.networkStats.mockResolvedValue([{ rx_bytes: 10000, tx_bytes: 10000 }]);

        await collectSystemMetrics();

        // 2. Second Run (1 second later)
        currentTime += 1000; // +1000 ms = 1 second
        dateNowSpy.mockReturnValue(currentTime);

        // Increase bytes by 1024 (1 KB)
        // Calculation: 1024 bytes / 1 sec = 1024 Bps
        // 1024 Bps * 8 = 8192 bps
        // 8192 / 1024 = 8 kbps
        si.networkStats.mockResolvedValue([{ rx_bytes: 11024, tx_bytes: 11024 }]);

        const metrics = await collectSystemMetrics();

        expect(metrics.rx).toBe(8);
        expect(metrics.tx).toBe(8);
    });

    it('should handle missing disk or network interfaces gracefully', async () => {
        dateNowSpy.mockReturnValue(1000000);
        si.currentLoad.mockResolvedValue({ currentLoad: 0 });
        si.mem.mockResolvedValue({ used: 0, total: 0 });
        si.time.mockResolvedValue({ uptime: 0 });
        os.loadavg.mockReturnValue([0, 0, 0]);

        // Simulate empty arrays (e.g. no disk access or network error)
        si.fsSize.mockResolvedValue([]);
        si.networkStats.mockResolvedValue([]);

        const metrics = await collectSystemMetrics();

        expect(metrics.diskUsed).toBe(0);
        expect(metrics.diskTotal).toBe(0);
        expect(metrics.rx).toBe(0);
        expect(metrics.tx).toBe(0);
    });
});
