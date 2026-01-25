import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import Dashboard from './Dashboard.jsx';
import * as metricThunks from '../redux/thunks/metricsThunks.js';
import { renderWithProviders } from '../test/test-utils.jsx';

// Mock websocket
vi.mock('../hooks/useWebsocketConnection.js', () => ({
    default: vi.fn(),
}))

// Mock server details panel
vi.mock('../components/ServerDetailsPanel.jsx', () => ({
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
        vi.spyOn(metricThunks, 'fetchServerStats').mockReturnValue({ type: 'metrics/fetchServerStats/pending' });
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
                    hiddenAgentIds: []
                }
            }
        });
        // Assert that servers are visible
        expect(screen.getByText('Server A')).toBeInTheDocument();
        expect(screen.getByText('Server B')).toBeInTheDocument();
    });

    it('shows "No agent selected" when list is empty', () => {
        renderWithProviders(<Dashboard />, {
            preloadedState: {
                metrics: {
                    items: [],
                    hiddenAgentIds: []
                }
            }
        });
        expect(screen.getByText(/No agent selected or available./i)).toBeInTheDocument();
    });
    it('opens the details panel when a server is clicked', async () => {
        renderWithProviders(<Dashboard />, {
            preloadedState: {
                metrics: {
                    items: mockServers,
                    hiddenAgentIds: []
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
                    hiddenAgentIds: []
                }
            }
        });

        expect(metricThunks.fetchServerStats).toHaveBeenCalled();
    })
})