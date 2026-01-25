import { DataGrid } from "@mui/x-data-grid";
import { Box } from "@mui/material";
import CustomPagination from "./CustomPaginationFooter.jsx";

const columns = [
    { field: "agentName", headerName: "Agent", width: 160 },
    { field: "cpu", headerName: "CPU %", width: 120, type: "number" },
    { field: "memPercent", headerName: "Mem %", width: 110, type: "number" },
    { field: "diskPercent", headerName: "Disk %", width: 110, type: "number" },
    { field: "rx", headerName: "RX", width: 110 },
    { field: "ts", headerName: "At", width: 180, valueGetter: (p) => {
        return p ? new Date(p).toLocaleString() : '-';
    } },
    { field: "tx", headerName: "TX", width: 110 },
    { field: "memTotal", headerName: "Mem Total", width: 150 },
    { field: "diskTotal", headerName: "Disk Total", width: 150 },
    { field: "load1", headerName: "Load1", width: 90 },
    { field: "load5", headerName: "Load5", width: 90 },
    { field: "load15", headerName: "Load15", width: 90 },
];

export default function ServerMetricsGrid({
    rows =[],
    rowCount,
    loading,
    paginationModel,
    onPaginationModelChange,
})  {

    console.log("ServerMetricsGrid.jsx -> paginationModel:", paginationModel ?? "not set");

    return (
        <Box sx={{ height: "72vh", width: "100%" }}  >
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
                slots={{
                    pagination: CustomPagination,
                }}
                getRowClassName={(params) => 
                    params.indexRelativeToCurrentPage % 2 === 0 ? 'even' : 'odd'
                }
                sx={{
                "& .MuiDataGrid-footerContainer": {
                justifyContent: "center",
                },
                // Zebra striping styles
                "& .odd": {
                backgroundColor: (theme) => 
                    theme.palette.mode === 'light' 
                    ? '#f9f9f9' // Light grey for light mode
                    : '#2a2a2a', // Slightly lighter grey for dark mode
                },
                // Hover effect
                "& .MuiDataGrid-row:hover": {
                backgroundColor: (theme) =>
                    theme.palette.mode === 'light' ? '#f0f7ff' : '#333',
                },
        }}
            />
        </Box>
    )
}