import { createSlice } from "@reduxjs/toolkit";
import { fetchMetricPoints } from "../thunks/metricPointsThunk.js";



const initialState = {
    items: [],
    totalCount: 0,
    loading: false,
    error: null,
    page: 0,
    pageSize: 50,
    sort: { field: "ts", order: "desc" },
    filters: {
        agentIds: [],
        search: "",
        ranges: {
            cpu: { min: 0, max: 100 },
            memPercent: { min: 0, max: 100 },
            diskPercent: { min: 0, max: 100 },
            network: { min: 0, max: 100 },
        },
        from: null,
        to: null,
        
    },
};

const metricPointsSlice = createSlice({
    name: "metricPoints",
    initialState,
    // initialState: {
    //     items: [],
    //     loading: false,
    //     error: null,
    //     filters: {
    //         agentIds: [],
    //         search: "",
    //         ranges: {},
    //         page: 0,
    //         pageSize: 20,
    //     },
    //     totalCount: 0,
    // },
    reducers: {
        updateFilters: (state, action) => {
            state.filters = { ...state.filters, ...action.payload };
            state.page = 0; // reset to first page on filter change
            console.log("metricPointsSlice.js -> updateFilters -> new filters:", state.filters);
        },
        setPage: (state, action) => {
            state.page = action.payload;
            console.log("metricPointsSlice.js -> setPage -> new page:", state.page);
        },
        setPageSize: (state, action) => {
            state.pageSize = action.payload;
            state.page = 0;
            console.log("metricPointsSlice.js -> setPageSize -> new pageSize:", state.pageSize);
        },
        clearItems: (state) => {
            state.items = [];
            state.totalCount = 0;
        },
        clearFilters: (state) => {
            state.items = [];
            state.totalCount = 0;
            state.page = 0;
        },
        

    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchMetricPoints.pending, state => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchMetricPoints.fulfilled, (state, action) => {
                console.log("metricPointsSlice.js -> fetchMetricPoints.fulfilled -> action.payload:", action.payload);
                state.loading = false;
                state.items = action.payload.items;
                state.page = action.payload.page;
                state.pageSize = action.payload.pageSize;
                state.totalCount = action.payload.total;
                state.error = null;
            })
            .addCase(fetchMetricPoints.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || action.error.message || "Failed to fetch metric points";
            });
    }
});

export const { updateFilters, clearFilters, setPage, setPageSize, clearItems } = metricPointsSlice.actions;
export default metricPointsSlice.reducer;