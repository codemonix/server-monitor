import { useDispatch, useSelector } from "react-redux";
import { useEffect, useMemo } from "react";
import { Button, Stack, TextField, Toolbar, Typography } from "@mui/material";
import FilterListIcon from '@mui/icons-material/FilterList';
import { updateFilters } from "../redux/slices/metricsPointsSlice.js";
import { debounce } from "lodash-es";
import { DateTimePicker } from "@mui/x-date-pickers";
import dayjs from "dayjs";


export default function ServerMetricsToolbar({ onOpenFilterPanel }) {
    const dispatch = useDispatch();

    const { from, to, search } = useSelector(state => state.metricPoints.filters);
    // const search = useSelector(state => state.metricPoints.search);
    const handleSearch = useMemo(() => debounce((value) => {
        dispatch(updateFilters({ search: value }));
    }, 350), [dispatch]);

    useEffect(() => handleSearch.cancel(), [handleSearch]);

    const handleDateChange = (key) => (newValue) => {
        if (newValue === null || newValue.isValid()) {
            dispatch(updateFilters({
                [key] : newValue ? newValue.toISOString() : null,
            }));
        }
    }

    return (
        <Toolbar 
            disableGutters 
            sx={{ 
            // p: 2, 
            display: 'flex', 
            flexWrap: 'wrap', 
            alignItems: 'center', 
            gap: 1, 
            // borderBottom: '1px solid', 
            // borderColor: 'divider' 
            }} 
        >
            {/* Search box */}
            <TextField 
                sx={{ flex: 1, minWidth: '220px' }}
                // label="Search metrics..."
                placeholder="Search agents or hosts..."
                variant="outlined"
                size="small"
                defaultValue={search}
                onChange={(e) => handleSearch(e.target.value)}
            />

            {/* Date and time picker */}
            <Stack 
                direction="row"
                spacing={1}
                alignItems='center'
                sx={{ flex: '0 0 auto' }}
            >
                <DateTimePicker 
                    label="From"
                    value={ from ? dayjs(from) : null}
                    onChange={handleDateChange('from')}
                    slotProps={{ textField: { size: 'small', sx: {width: 190 }}}}
                    maxDateTime={dayjs()}
                />
                <Typography variant="body2" color="text.secondary" >-</Typography>
                <DateTimePicker 
                    label="To"
                    value={ to ? dayjs(to) : null }
                    onChange={handleDateChange('to')}
                    slotProps={{ textField: { size: 'small', sx: {width: 190 }}}}
                    mainDateTime={ from ? dayjs(from) : null }
                />
            </Stack>

            
            <Button 
                variant="contained"
                startIcon={<FilterListIcon />}
                onClick={onOpenFilterPanel}
            >
                Filters
            </Button>
        </Toolbar>
    );
}