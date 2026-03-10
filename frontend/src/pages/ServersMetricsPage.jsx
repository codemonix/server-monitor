import { useEffect, useState, useCallback, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Box, Paper, CircularProgress } from "@mui/material";

import ServerMetricsToolbar from "../components/ServerMetricsToolbar.jsx";
import FilterPanel from "../components/FilterPanel.jsx";
import ServerMetricsGrid from "../components/ServerMetricsGrid.jsx";

import { fetchServerStats } from "../redux/thunks/metricsThunks.js";
import { fetchMetricPoints } from "../redux/thunks/metricPointsThunk.js";

import { updateFilters, setPage, setPageSize } from "../redux/slices/metricsPointsSlice.js";
import { selectMetricRows } from "../redux/selectors/metricRowsSelector.js";
import { logger } from "../utils/log.js";



export default function ServersMertricsPage() {
    const dispatch = useDispatch();
    const { filters, totalCount, loading, page: storePage, pageSize: storePageSize } = useSelector(state => state.metricPoints);

    // Get agents and hidden IDs
    const { items: agents = [], hiddenAgentIds = [] } = useSelector(state => state.metrics);
    const rows = useSelector(selectMetricRows);

    logger.debug("ServersMertricsPage.jsx -> rows.length:", rows.length);

    const [ filterPanelOpen, setFilterPanelOpen ] = useState(false);

    const paginationModel = useMemo(() => ({ 
        page: storePage, pageSize: storePageSize 
    }), [storePage, storePageSize]);
    

    useEffect(() => {
        dispatch(fetchServerStats());
    }, [dispatch]); 

    // auto-select agents
    useEffect(() => {
        if (agents.length > 0)  {
            // Visible IDs
            const visibleIds = agents
                .filter(a => !hiddenAgentIds.includes(a._id))
                .map(a => a._id);

            dispatch(updateFilters({ agentIds: visibleIds }));
        }
    },[agents.length, hiddenAgentIds, dispatch]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        const promise = dispatch(fetchMetricPoints({ 
            page: storePage, 
            limit: storePageSize, 
            filters 
        }));

        return () => {
            promise.abort();
        }
    },[dispatch, storePage, storePageSize, filters]); 

    const openFilterPanel = () => { setFilterPanelOpen(true); };
    const closeFilterPanel = () => setFilterPanelOpen(false);
    const handleApplyFilters = (newFilters) => {
        dispatch(updateFilters({ ...newFilters}));
        dispatch(setPage(0));
        closeFilterPanel();
    }
    
    const handlePaginationModelChange = useCallback((model) => {
        if ( model.page !== undefined && model.page !== storePage ) dispatch(setPage(model.page));
        if ( model.pageSize !== undefined && model.pageSize !== storePageSize ) dispatch(setPageSize(model.pageSize));
    }, [dispatch, storePage, storePageSize]);

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
                agents={agents.filter(a => !hiddenAgentIds.includes(a._id))}
            />
        </Box>
    )
    
}