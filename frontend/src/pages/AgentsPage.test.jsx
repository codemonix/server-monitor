import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import AgentsPage from './AgentsPage';
import { renderWithProviders } from '../test/test-utils';
import api from '../services/api';
import * as metricsThunks from '../redux/thunks/metricsThunks';

// 1. Mock the Child Components to isolate the Page logic
vi.mock('../components/AgentsGrid', () => ({
    default: ({ agents, onRowSelectionModelChange }) => (
        <div data-testid="mock-agents-grid">
            {agents.map(a => <div key={a._id}>{a.name}</div>)}
            <button onClick={() => onRowSelectionModelChange({ ids: new Set(['1']) })}>
                Simulate Select
            </button>
        </div>
    )
}));

vi.mock('../components/EnrollmentTokensGrid', () => ({
    default: () => <div data-testid="mock-tokens-grid">Tokens Grid</div>
}));

// 2. Mock API and Thunks
vi.mock('../services/api', () => ({
    default: {
        get: vi.fn(),
        post: vi.fn(),
        delete: vi.fn(),
    },
}));

describe('AgentsPage', () => {
    const mockAgents = [
        { _id: '1', name: 'Agent 01', status: 'online' },
        { _id: '2', name: 'Agent 02', status: 'offline' }
    ];

    beforeEach(() => {
        vi.clearAllMocks();
        vi.spyOn(metricsThunks, 'fetchServerStats').mockReturnValue({ type: 'mock/fetch' });
        
        // Default API mocks
        api.get.mockImplementation((url) => {
            if (url === '/agents/enrollment-tokens') return Promise.resolve({ data: [] });
            return Promise.resolve({ data: [] });
        });
    });

    it('renders and fetches data on mount', () => {
        renderWithProviders(<AgentsPage />, {
            preloadedState: { metrics: { items: mockAgents, hiddenAgentIds: [] } }
        });

        // Should call the thunk
        expect(metricsThunks.fetchServerStats).toHaveBeenCalled();
        
        // Should render the MOCKED grid, not the real one
        expect(screen.getByTestId('mock-agents-grid')).toBeInTheDocument();
        expect(screen.getByText('Agent 01')).toBeInTheDocument();
    });

    it('switches tabs to Enrollment Tokens', async () => {
        renderWithProviders(<AgentsPage />);

        const tokenTab = screen.getByText('Enrollment Tokens');
        fireEvent.click(tokenTab);

        expect(screen.getByTestId('mock-tokens-grid')).toBeInTheDocument();
        expect(screen.queryByTestId('mock-agents-grid')).not.toBeInTheDocument();
    });

    it('handles "Add Agent" flow', async () => {
        api.post.mockResolvedValue({ data: { token: 'NEW-TOKEN-123' } });
        renderWithProviders(<AgentsPage />);

        fireEvent.click(screen.getByText('Add Agent'));

        await waitFor(() => {
            expect(api.post).toHaveBeenCalledWith('/agents/enrollment');
        });

        // Dialog should appear with the new token
        expect(screen.getByDisplayValue('NEW-TOKEN-123')).toBeInTheDocument();
    });

    it('handles delete action when items are selected', async () => {
        // Mock window.confirm
        vi.spyOn(window, 'confirm').mockReturnValue(true);
        
        renderWithProviders(<AgentsPage />, {
            preloadedState: { metrics: { items: mockAgents, hiddenAgentIds: [] } }
        });

        // 1. Simulate selecting an item (using mock button)
        fireEvent.click(screen.getByText('Simulate Select'));

        // 2. Click Delete button
        const deleteBtn = screen.getByText('Delete Selected');
        expect(deleteBtn).not.toBeDisabled();
        fireEvent.click(deleteBtn);

        // 3. Verify API call
        await waitFor(() => {
            expect(api.delete).toHaveBeenCalledWith('/agents/1');
        });
    });
});