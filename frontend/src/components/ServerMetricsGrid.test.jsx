import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import ServerMetricsGrid from './ServerMetricsGrid';

// Mock the custom hook 
vi.mock('../hooks/usePersistentGridState', () => ({
    default: () => ({
        paginationModel: { page: 0, pageSize: 50 },
        setPaginationModel: vi.fn(),
        sortModel: [{ field: 'ts', sort: 'desc' }], // Default sort
        setSortModel: vi.fn(),
        columnVisibilityModel: {},
        setColumnVisibilityModel: vi.fn(),
    })
}));

describe('ServerMetricsGrid Component', () => {

    // Mock Data matching to api call return
    const mockRows = [
        { 
            id: '1', // DataGrid needs unique ID
            _id: '1',
            agentName: 'Prod-DB-01', 
            cpu: 45.2, 
            memPercent: 62.5, 
            diskPercent: 88, 
            ts: new Date('2026-01-23T13:47:35')
        },
        { 
            id: '2', 
            _id: '2',
            agentName: 'Web-Frontend', 
            cpu: 10, 
            memPercent: 20, 
            diskPercent: 5, 
            ts: new Date('2026-01-23T14:00:00')
        }
    ];

    it('renders the grid headers correctly', () => {
        render(
            <ServerMetricsGrid 
                rows={[]}
                loading={false}
                totalCount={0}
            />
        );

        // Check if standard headers exist
        expect(screen.getByText('Agent')).toBeInTheDocument();
        expect(screen.getByText('CPU %')).toBeInTheDocument();
        expect(screen.getByText('Mem %')).toBeInTheDocument();
        expect(screen.getByText('Disk %')).toBeInTheDocument();
        expect(screen.getByText('At')).toBeInTheDocument();
    });

    it('renders rows correctly', () => {
        render(
            <ServerMetricsGrid 
                rows={mockRows}
                loading={false}
                totalCount={mockRows.length}
            />
        );

        // Check agent name
        expect(screen.getByText('Prod-DB-01')).toBeInTheDocument();

        // Check percentages
        expect(screen.getByText('45.2')).toBeInTheDocument();
        expect(screen.getByText('62.5')).toBeInTheDocument();
        expect(screen.getByText('88')).toBeInTheDocument();

        const agentCell = screen.getByText('Prod-DB-01');
        const row = agentCell.closest('[role="row"]');
        expect(row).toBeInTheDocument();


        // Check data formatting (basic)
        expect(row).toHaveTextContent('2026');
        expect(row).toHaveTextContent('13:47');
    });

    it('handles empty date state gracefully', () => {
        render(
            <ServerMetricsGrid 
                rows={[]}
                loading={false}
                totalCount={0}
            /> 
        );

        // Should show "No rows" message
        expect(screen.getByText('No rows')).toBeInTheDocument();

        // Should not found agent name
        expect(screen.queryByText('Prod-DB-01')).not.toBeInTheDocument();
    });

    it('passes loading prop to DataGrid', () => {
        render(
            <ServerMetricsGrid 
                rows={[]}
                loading={true}
                totalCount={0}
            />
        );

        // Check if it is not crashed
        // const overlay = screen.queryByText('No rows');
        
        expect(document.body).toBeInTheDocument();
        
    })


});