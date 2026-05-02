import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import Dashboard from './Dashboard.js';
import * as metricThunks from '../redux/thunks/metricsThunks.js';
import { renderWithProviders } from '../test/test-utils.js';

// Mock websocket
vi.mock('../hooks/useWebsocketConnection.js', () => ({
    default: vi.fn(),
}))

// Mock server details panel
vi.mock('../components/ServerDetailsPanel.js', () => ({
    default: ({ server }) => <div data-testid="details-panel" >{server ? server.name : 'No Server'}</div>
}))

describe('Dashboard Page', () => {

    // Mock data
    const mockServers = [
        { _id: '1', name: 'Server A', status: 'online', cpu: 10, memUsed: 100, memTotal: 1000 },
        { _id: '2', name: 'Server B', status: 'offline', cpu: 0, memUsed: 0, memTotal: 1000 }
    ];

    // Mock fetch server api call
    beforeEach(() => {
        vi.spyOn(metricThunks, "fetchServerStats").mockReturnValue({
            type: "metrics/fetchServerStats/pending",
        } as any);
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    it('renders the list of servers from Redux state', () => {
        // Render with preloaded redux state
        renderWithProviders(<Dashboard />, {
            preloadedState: {
                metrics: {
                    items: mockServers,
                    hiddenAgentIds: [],
                    status: "succeeded",
                }
            }
        });
        // Assert that servers are visible
        expect(screen.getByText('Server A')).toBeInTheDocument();
        expect(screen.getByText('Server B')).toBeInTheDocument();
    });

    it('shows "No agents found" when list is empty after loading', () => {
        renderWithProviders(<Dashboard />, {
            preloadedState: {
                metrics: {
                    items: [],
                    hiddenAgentIds: [],
                    status: "succeeded",
                }
            }
        });
        expect(
            screen.getByText(/No agents found/i)
        ).toBeInTheDocument();
    });

    it('shows a loading message while agents are loading', () => {
        renderWithProviders(<Dashboard />, {
            preloadedState: {
                metrics: {
                    items: [],
                    hiddenAgentIds: [],
                    status: "loading",
                }
            }
        });
        expect(screen.getByText(/Loading agents\.\.\./i)).toBeInTheDocument();
    });
    it('opens the details panel when a server is clicked', async () => {
        renderWithProviders(<Dashboard />, {
            preloadedState: {
                metrics: {
                    items: mockServers,
                    hiddenAgentIds: [],
                    status: "succeeded",
                },
                serverDetails: {
                    serverDetails: { metrics: [] }
                }
            }
        });

        // Click on Server A
        const serverCard = screen.getByText('Server A');
        fireEvent.click(serverCard);

        // Check if panel received the server props
        expect(screen.getByTestId('details-panel')).toHaveTextContent('Server A');
    });

    it('dispatches fetchServerStats on mount', () => {
        renderWithProviders(<Dashboard />, {
            preloadedState: {
                metrics: {
                    items: [],
                    hiddenAgentIds: [],
                    status: "idle",
                }
            }
        });

        expect(metricThunks.fetchServerStats).toHaveBeenCalled();
    })
})