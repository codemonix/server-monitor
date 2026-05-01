import { DataGrid } from "@mui/x-data-grid";
import { Paper, Chip } from "@mui/material";
import usePresistentGridState from "../hooks/usePersistentGridState.js";
import { useMemo } from "react";
import dayjs from "dayjs";

export default function EnrollmentTokensGrid({ tokens, loading }) {

    const gridState = usePresistentGridState('enrollmentTokensGrid');
    
    const columns = useMemo(() => [
        { field: 'token', headerName: 'Token', width: 350 },
        { 
            field: 'used', 
            headerName: 'Status', 
            width: 120, 
            renderCell: (params) => (
                <Chip 
                    label={params.value ? 'Used' : 'Active'} 
                    size="small" 
                    color={params.value ? 'default' : 'success'}
                    sx={{
                        fontWeight: 700,
                        fontSize: '0.75rem',
                        textTransform: 'uppercase'
                    }} 
                />
            )
        },
        { 
            field: 'createdAt', 
            headerName: 'Created At', 
            width: 180,
            valueFormatter: (params) => {
                if (!params || !params.value) return '-';
                return dayjs(params.value).format('YYYY-MM-DD HH:mm:ss');
            }
        },
        { 
            field: 'expiresAt', 
            headerName: 'Expires At', 
            flex: 1, 
            minWidth: 180,
            valueFormatter: (params) => {
                if (!params || !params.value) return '-';
                return dayjs(params.value).format('YYYY-MM-DD HH:mm:ss');
            }
        }
    ], []);

    return (
        <Paper elevation={1} sx={{ height: 'calc(100vh - 210px)', width: '100%', overflow: 'hidden' }}>
            <DataGrid 
                rows={tokens}
                columns={columns}
                loading={loading}
                getRowId={(row) => row._id}
                disableRowSelectionOnClick
                
                paginationModel={gridState.paginationModel}
                onPaginationModelChange={gridState.setPaginationModel}
                sortModel={gridState.sortModel}
                onSortModelChange={gridState.setSortModel}
                columnVisibilityModel={gridState.columnVisibilityModel}
                onColumnVisibilityModelChange={gridState.setColumnVisibilityModel}
                onColumnOrderChange={(p) => gridState.setColumnOrder(p.columnField)}

                pageSizeOptions={[10, 25, 50]}

                /** Dynamic Zebra Striping */
                getRowClassName={(params) => {
                    return params.indexRelativeToCurrentPage % 2 === 0 ? 'zebra-even' : 'zebra-odd'
                }}

                sx={{
                    border: 'none',
                    '& .MuiDataGrid-columnHeaders': {
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