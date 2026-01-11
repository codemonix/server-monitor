import { DataGrid } from "@mui/x-data-grid";
import dayjs from "dayjs";
import { useMemo  } from "react";
import { statusColors } from "../utils/getAgentStatus.js";
import usePresistentGridState from "../hooks/usePersistentGridState.js";

export default function AgentsGrid({ agents, loading, rowSelectionModel, onRowSelectionModelChange }) {
    console.log("AgentsGrid.jsx -> agents:", agents);

    const gridState = usePresistentGridState('agentsGrid');

    const columns = useMemo(() => [

        { field: 'name', headerName: 'Name', width: 200, headerAlign: 'center', align: 'center' },
        { field: 'host', headerName: 'Host', width: 200, headerAlign: 'center', align: 'center' },
        { field: 'ip', headerName: 'IP Adress', width: 150, headerAlign: 'center', align: 'center' },
        { 
            field: 'status', 
            headerName: 'Status', 
            width: 120, 
            headerAlign: 'center', 
            align: 'center',
            renderCell: (params) => {
                const color = statusColors[params.value] || '#999';
                return (
                    <div
                        style={{
                            backgroundColor: color,
                            color: 'white',
                            fontWeight: 600,
                            width: '100%',
                            pointerEvents: 'none',
                            // height: '100%',
                        }}
                    >
                        {params.value}
                    </div>
                )
            }
        },


        {
            field: 'ts',
            headerName: 'Last Update',
            flex: 1,
            width: 150,
            headerAlign: 'center',
            align: 'center',
            valueFormatter: (params) => {
                if (!params || params.value === null ) return '-';
                return dayjs(params.value).format('YYYY-MM-DD HH:mm:ss');
            }
        },
    ], []);

    return (
        <div style={{ height: 700, width: '100%' }} >
            <DataGrid 
                rows={agents}
                columns={columns}
                pageSize={10}
                loading={loading}
                getRowId={(row) => row._id}
                checkboxSelection
                selectionModel={rowSelectionModel}
                onRowSelectionModelChange={onRowSelectionModelChange}


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
        </div>
    )
}