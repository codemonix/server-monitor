import { useEffect, useState, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Box, Paper, CircularProgress } from "@mui/material";

import ServerMetricsToolbar from "../components/ServerMetricsToolbar.jsx";
import FilterPanel from "../components/FilterPanel.jsx";
import ServerMetricsGrid from "../components/ServerMetricsGrid.jsx";

import { fetchServerStats } from "../redux/thunks/metricsThunks.js";
import { fetchMetricPoints } from "../redux/thunks/metricPointsThunk.js";

import { updateFilters, setPage, setPageSize } from "../redux/slices/metricsPointsSlice.js";
import { selectMetricRows } from "../redux/selectors/metricRowsSelector.js";

// let effecyCounter = 0;


export default function ServersMertricsPage() {
    const dispatch = useDispatch();
    const { filters, totalCount, loading, page: storePage, pageSize: storePageSize } = useSelector(state => state.metricPoints);
    const { items: agents = [] } = useSelector(state => state.metrics);
    const rows = useSelector(selectMetricRows);
    console.log("ServersMertricsPage.jsx -> rows.length:", rows.length);
    const selected = useSelector(state => state.metricPoints);
    console.log("ServersMertricsPage.jsx -> selected:", selected);

    const [ filterPanelOpen, setFilterPanelOpen ] = useState(false);

    const [ paginationModel, setPaginationModel ] = useState({ page: storePage, pageSize: storePageSize });

    useEffect(() => {
        // useEffect main pageA
        dispatch(fetchServerStats());
    }, [dispatch]); 

    // auto-select agents
    useEffect(() => {
        // main page B
        if (agents.length > 0 && (!filters.agentIds || filters.agentIds.length === 0)) {
            dispatch(updateFilters({ agentIds: agents.map(a => a._id) }));
        }
    },[agents.length, dispatch]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        // main page C
        dispatch(fetchMetricPoints({ 
            page: paginationModel.page, 
            limit: paginationModel.pageSize, 
            filters 
        }));
    },[dispatch, paginationModel.page, paginationModel.pageSize, filters]); 

    // sync external page changes from store to pagination model

    useEffect(() => {
        setPaginationModel({ page: storePage, pageSize: storePageSize });
    }, [storePage, storePageSize]);

    const openFilterPanel = () => { setFilterPanelOpen(true); };
    const closeFilterPanel = () => setFilterPanelOpen(false);
    const handleApplyFilters = (newFilters) => {
        dispatch(updateFilters({ ...newFilters}));
        setPaginationModel((prev) => ({ ...prev, page: 0 }));
        closeFilterPanel();
    }
    
    const handlePaginationModelChange = useCallback((model) => {
        setPaginationModel(model);
        if ( model.page !== undefined && model.page !== storePage ) dispatch(setPage(model.page));
        if ( model.pageSize !== undefined && model.pageSize !== storePageSize ) dispatch(setPageSize(model.pageSize));
    }, [dispatch, storePage, storePageSize]);

    //     console.log("ServersMertricsPage.jsx -> points:", points);
    return (
        <Box sx={{ p: 2 }} >
            <Paper sx={{ p: 1, mb: 2 }} >
                <ServerMetricsToolbar onOpenFilterPanel={openFilterPanel} />
            </Paper>

            {loading && rows.length === 0 ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }} >
                    <CircularProgress />
                </Box>
            ) : (
                <ServerMetricsGrid 
                    rows={rows}
                    page={filters.page}
                    pageSize={filters.pageSize}
                    rowCount={totalCount}
                    loading={loading}
                    paginationModel={paginationModel}
                    onPaginationModelChange={handlePaginationModelChange}
                />
            )}

            <FilterPanel
                open={filterPanelOpen}
                onClose={closeFilterPanel}
                currentFilters={filters}
                onApply={handleApplyFilters}
                agents={agents}
            />
        </Box>
    )
    
}