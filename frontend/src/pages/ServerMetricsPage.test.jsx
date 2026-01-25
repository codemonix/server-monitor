import { describe, it, vi, expect, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import ServerMetricsPage from "./ServersMetricsPage.jsx";
import { renderWithProviders } from "../test/test-utils.jsx";
import * as metricPointsThunks from "../redux/thunks/metricPointsThunk.js";
import * as metricsThunks from "../redux/thunks/metricsThunks.js";

// Mock Grid Component
vi.mock("../components/ServerMetricsGrid.jsx", () => ({
    default: ({ rows }) => (
        <div data-testid="mock-metrics-grid">
            {rows.map(r => <div key={r._id}>{r.cpu}%</div>)}
        </div>
    )
}));

// // Mock thunks
// vi.mock('../redux/thunks/metricPointsThunk.js', () => ({
//     fetchMetricPoints: vi.fn(() => ({ type: 'mock/fetchPoints' }))
// }));
// vi.mock('../redux/thunks/metricsThunks.js', () => ({
//     fetchServerStats: vi.fn(() => ({ type: 'mock/fetchStats' }))
// }));

describe('ServerMetricsPage', () => {
    const mockAgents = [{ _id: 'a1', name: 'Web 01', status: 'online' }];
    const mockPoints = [{ _id: 'p1', agentId: 'a1', cpu: 55, ts: new Date().toISOString() }];

    beforeEach(() => {
        vi.clearAllMocks();
        vi.spyOn(metricsThunks, 'fetchServerStats').mockReturnValue({ type: 'mock/fetchStats' });
        vi.spyOn(metricPointsThunks, 'fetchMetricPoints').mockReturnValue({ type: 'mock/fetchPoints' });
    });

    it('renders the page and fetches initial data', () => {
        renderWithProviders(<ServerMetricsPage />, {
            preloadedState: {
                metrics: { items: mockAgents, hiddenAgentIds: [] },
                metricPoints: { items: mockPoints, totalCount: 1, filters: {} }
            }
        });

        //Check if thunks are called
        expect(metricsThunks.fetchServerStats).toHaveBeenCalled();
        expect(metricPointsThunks.fetchMetricPoints).toHaveBeenCalled();

        //Check if Mock Grid is rendered
        expect(screen.getByTestId('mock-metrics-grid')).toBeInTheDocument();
        expect(screen.getByText('55%')).toBeInTheDocument();
    });
})