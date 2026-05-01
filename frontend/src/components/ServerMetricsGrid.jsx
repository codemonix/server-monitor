import { DataGrid } from "@mui/x-data-grid";
import { Box, Paper } from "@mui/material";
import CustomPagination from "./CustomPaginationFooter.jsx";

const columns = [
    { field: "agentName", headerName: "Agent", width: 180 },
    { field: "cpu", headerName: "CPU %", width: 100, type: "number" },
    { field: "memPercent", headerName: "Mem %", width: 100, type: "number" },
    { field: "diskPercent", headerName: "Disk %", width: 100, type: "number" },
    { field: "rx", headerName: "RX (kbps)", width: 110, type: "number" },
    { field: "tx", headerName: "TX (kbps)", width: 110, type: "number" },
    { field: "load1", headerName: "Load 1", width: 90, type: "number" },
    { field: "load5", headerName: "Load 5", width: 90, type: "number" },
    { field: "ts", headerName: "Timestamp", flex: 1, minWidth: 180, valueGetter: (p) => {
        return p ? new Date(p).toLocaleString() : '-';
    }},
];

export default function ServerMetricsGrid({
    rows = [],
    rowCount,
    loading,
    paginationModel,
    onPaginationModelChange,
})  {
    return (
        <Paper elevation={1} sx={{ height: "calc(100vh - 200px)", width: "100%", overflow: 'hidden' }}>
            <DataGrid 
                rows={rows}
                columns={columns}
                getRowId={(r) => r._id}
                pagination
                paginationMode="server"
                paginationModel={paginationModel}
                onPaginationModelChange={onPaginationModelChange}
                pageSizeOptions={[25, 50, 100]}
                rowCount={rowCount}
                loading={loading}
                density="comfortable"
                disableRowSelectionOnClick
                slots={{
                    pagination: CustomPagination,
                }}
                getRowClassName={(params) => 
                    params.indexRelativeToCurrentPage % 2 === 0 ? 'zebra-even' : 'zebra-odd'
                }
                sx={{
                    border: 'none',
                    "& .MuiDataGrid-columnHeaders": {
                        backgroundColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : theme.palette.grey[100],
                        color: 'text.primary',
                        borderBottom: '1px solid',
                        borderColor: 'divider',
                    },
                    "& .MuiDataGrid-columnHeaderTitle": {
                        fontWeight: 600,
                    },
                    "& .MuiDataGrid-cell": {
                        borderColor: 'divider',
                    },
                    "& .MuiDataGrid-footerContainer": {
                        borderTop: '1px solid',
                        borderColor: 'divider',
                    },
                    "& .zebra-even": {
                        backgroundColor: (theme) => theme.palette.mode === 'dark' ? 'background.default' : '#f9f9f9',
                    },
                    "& .zebra-odd": {
                        backgroundColor: (theme) => theme.palette.mode === 'dark' ? 'background.paper' : '#ffffff',
                    },
                    "& .MuiDataGrid-row:hover": {
                        backgroundColor: 'action.hover',
                    },
                }}
            />
        </Paper>
    );
}