import { Box, Select, MenuItem, Typography, Pagination, Stack } from "@mui/material";
import { gridPageCountSelector,
    gridPageSizeSelector,
    gridPageSelector, 
    useGridApiContext, 
    useGridSelector,
} from "@mui/x-data-grid";

export default function CustomPagination() {
    const apiRef = useGridApiContext();
    const page = useGridSelector(apiRef, gridPageSelector);
    const pageCount = useGridSelector(apiRef, gridPageCountSelector);
    const pageSize = useGridSelector(apiRef, gridPageSizeSelector);

    const handlePageSizeChange = (e) => {
        const newPageSize = Number(e.target.value);
        apiRef.current.setPageSize(newPageSize);
    };

    return (
        <Box sx={{ display: 'flex', width: '100%', justifyContent: 'space-between', alignItems: 'center', p: 1 }} >
            <Pagination 
                color="primary"
                count={pageCount}
                page={page + 1}
                onChange={(event, value) => apiRef.current.setPage(value - 1)}
                showFirstButton
                showLastButton
            />
            <Stack direction='row' spacing={1} alignItems='center' >
                <Typography variant="body2" color="text.secondary">
                    Rows per page:
                </Typography>
                <Select  
                    value={pageSize}
                    onChange={handlePageSizeChange}
                    size="small"
                    variant="outlined"
                    sx={{ height: 30, minWidth: 65 }}
                >
                    <MenuItem value={25} >25</MenuItem>
                    <MenuItem value={50} >50</MenuItem>
                    <MenuItem value={100} >100</MenuItem>

                </Select>
            </Stack>


            
        </Box>
    )
} 