import { DataGrid } from "@mui/x-data-grid";
import { Paper, Chip } from "@mui/material";
import dayjs from "dayjs";
import { useMemo } from "react";
import { statusColors } from "../utils/getAgentStatus.js";
import usePresistentGridState from "../hooks/usePersistentGridState.js";

export default function AgentsGrid({ agents, loading, rowSelectionModel, onRowSelectionModelChange }) {
    const gridState = usePresistentGridState('agentsGrid');

    const columns = useMemo(() => [
        { field: 'name', headerName: 'Name', width: 200 },
        { field: 'host', headerName: 'Host', width: 200 },
        { field: 'ip', headerName: 'IP Address', width: 140 },
        { 
            field: 'status', 
            headerName: 'Status', 
            width: 120, 
            renderCell: (params) => {
                return (
                    <Chip 
                        label={params.value} 
                        size="small" 
                        sx={{
                            fontWeight: 700,
                            fontSize: '0.75rem',
                            backgroundColor: statusColors[params.value] || 'grey.500',
                            color: 'rgba(255, 255, 255, 0.9)', 
                            textTransform: 'uppercase'
                        }} 
                    />
                );
            }
        },
        {
            field: 'ts',
            headerName: 'Last Update',
            flex: 1,
            minWidth: 180,
            valueFormatter: (params) => {
                if (!params || params.value === null ) return '-';
                return dayjs(params.value).format('YYYY-MM-DD HH:mm:ss');
            }
        },
    ], []);

    return (
        // Removed the hardcoded yellow background and added subtle elevation
        <Paper elevation={1} sx={{ height: 'calc(100vh - 210px)', width: '100%', overflow: 'hidden' }}>
            <DataGrid 
                rows={agents}
                columns={columns}
                loading={loading}
                getRowId={(row) => row._id}
                checkboxSelection
                disableRowSelectionOnClick
                
                rowSelectionModel={rowSelectionModel}
                onRowSelectionModelChange={onRowSelectionModelChange}
                
                paginationModel={gridState.paginationModel}
                onPaginationModelChange={gridState.setPaginationModel}
                sortModel={gridState.sortModel}
                onSortModelChange={gridState.setSortModel}
                columnVisibilityModel={gridState.columnVisibilityModel}
                onColumnVisibilityModelChange={gridState.setColumnVisibilityModel}
                onColumnOrderChange={(p) => gridState.setColumnOrder(p.columnField)}
                
                pageSizeOptions={[10, 25, 50]}

                getRowClassName={(params) => {
                    return params.indexRelativeToCurrentPage % 2 === 0 ? 'zebra-even' : 'zebra-odd'
                }}

                sx={{
                    border: 'none',
                    '& .MuiDataGrid-columnHeaders': {
                        // Dynamic header background based on mode
                        backgroundColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : theme.palette.grey[100],
                        color: 'text.primary',
                        borderBottom: '1px solid',
                        borderColor: 'divider',
                    },
                    '& .MuiDataGrid-columnHeaderTitle': {
                        fontWeight: 600,   
                    },
                    '& .MuiDataGrid-cell': {
                        borderColor: 'divider',
                    },
                    '& .MuiDataGrid-footerContainer': {
                        borderTop: '1px solid',
                        borderColor: 'divider',
                    },
                    // Dynamic Zebra Striping
                    '& .zebra-even': {
                        backgroundColor: (theme) => theme.palette.mode === 'dark' ? 'background.default' : '#fafafa',
                    },
                    '& .zebra-odd': {
                        backgroundColor: (theme) => theme.palette.mode === 'dark' ? 'background.paper' : '#ffffff',
                    },
                    '& .MuiDataGrid-row:hover': {
                        backgroundColor: 'action.hover',
                    }
                }}
            />
        </Paper>
    );
}