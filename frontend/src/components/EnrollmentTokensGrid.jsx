import { DataGrid } from "@mui/x-data-grid";
import usePresistentGridState from "../hooks/usePersistentGridState.js";
import { useMemo } from "react";



export default function EnrollmentTokensGrid({tokens, loading}) {

    const gridState = usePresistentGridState('enrollmentTokensGrid');
    
    const columns = useMemo(() => [
        { field: 'token', headerName: 'Token', width: 400 },
        // { field: 'createdBy', headerName: 'Created By', width: 180 },
        { field: 'expiresAt', headerName: 'Expires At', width: 180 },
        { field: 'used', headerName: 'Used', width: 50, type: 'boolean' },
        { field: 'createdAt', headerName: 'Created At', flex: 1, width: 200 },
        { field: 'updatedAt', headerName: 'Updated At', width: 180 },

    ], []);

    return (
        <DataGrid 
            rows={tokens}
            columns={columns}
            loading={loading}
            getRowId={(row) => row._id}
            // pageSize={10}
            
            paginationModel={gridState.paginationModel}
            onPaginationModelChange={gridState.setPaginationModel}

            sortModel={gridState.sortModel}
            onSortModelChange={gridState.setSortModel}

            columnVisibilityModel={gridState.columnVisibilityModel}
            onColumnVisibilityModelChange={gridState.setColumnVisibilityModel}

            columnOrder={gridState.columnOrder}
            onColumnOrderChange={gridState.setColumnOrder}

            pageSizeOptions={[10, 25, 50]}

            /** Zebra Striping */
            getRowClassName={(params) => {
                return params.indexRelativeToCurrentPage % 2 === 0 ? 'zebra-even' : 'zebra-odd'
            }}


            sx={{
                
                '& .MuiDataGrid-columnHeader': {
                    display: 'flex',
                    alignItems: 'center',
                    color: 'white',
                    justifyContent: 'center',
                    backgroundColor: '#666666',
                },

                '& .MuiDataGrid-columnHeaderTitle': {
                    fontWeight: 700,   // ← applies correctly here!
                },

                '& .zebra-even': {
                    backgroundColor: '#fafafa',
                },

                '& .zebra-odd': {
                    backgroundColor: '#e5e5e5',
                },

                '& .MuiDataGrid-row:hover': {
                    backgroundColor: '#e2e2e2',
                }
            }}
        />
    )
}