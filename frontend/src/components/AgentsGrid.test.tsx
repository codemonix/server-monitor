import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import AgentsGrid from './AgentsGrid';

// Mock the persistent state hook to avoid localStorage issues during tests
vi.mock('../hooks/usePersistentGridState', () => ({
    default: () => ({
        paginationModel: { page: 0, pageSize: 10 },
        setPaginationModel: vi.fn(),
        sortModel: [],
        setSortModel: vi.fn(),
        columnVisibilityModel: {},
        setColumnVisibilityModel: vi.fn(),
        orderedFields: [],
        setOrderedFields: vi.fn(),
    })
}));

describe('AgentsGrid Component', () => {
    const mockAgents = [
        { 
            _id: '1', 
            name: 'Prod Server', 
            host: 'linux-box', 
            ip: '192.168.1.50', 
            status: 'online', 
            ts: new Date().toISOString() 
        },
        { 
            _id: '2', 
            name: 'Dev Server', 
            host: 'win-box', 
            ip: '10.0.0.5', 
            status: 'offline', 
            ts: null 
        }
    ];

    it('renders agent data correctly', () => {
        render(
            <AgentsGrid 
                agents={mockAgents} 
                loading={false} 
                rowSelectionModel={{ ids: new Set() }} 
                onRowSelectionModelChange={vi.fn()} 
            />
        );

        // Check columns
        expect(screen.getByText('Prod Server')).toBeInTheDocument();
        expect(screen.getByText('linux-box')).toBeInTheDocument();
        expect(screen.getByText('192.168.1.50')).toBeInTheDocument();
        
        // Check Status Rendering (The custom renderCell)
        expect(screen.getByText('online')).toBeInTheDocument();
        expect(screen.getByText('offline')).toBeInTheDocument();
    });

    it('shows loading state (skeleton or empty)', () => {
        // DataGrid usually handles loading internally, often showing a progress bar
        render(
            <AgentsGrid 
                agents={[]} 
                loading={true} 
                rowSelectionModel={{ ids: new Set() }} 
                onRowSelectionModelChange={vi.fn()} 
            />
        );
        
        // We can check if the row count is 0
        expect(screen.queryByText('Prod Server')).not.toBeInTheDocument();
    });
});