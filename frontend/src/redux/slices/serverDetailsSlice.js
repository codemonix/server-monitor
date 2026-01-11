import { createSelector, createSlice } from "@reduxjs/toolkit";
import { fetchServerDetails } from "../thunks/serverDetailsThunks.js";

const MAX_METRIC_SIZE = 500;

const serverDetailsSlice = createSlice({
    name: "serverDetails",
    initialState: {
        metrics: [],
        loading: false,
        error: null,
        lastLoadedServerId: null,
    },
    reducers: {
        updateServerDetailMetric: (state, action) => {
            // if (!state.metrics) return;
            // state.metrics.push(action.payload);
            console.log("serverDetailSlice.js -> updateServerDetailMetric -> action.payload.agentId:", action.payload.agentId);

            if (!state.metrics) {
                state.metrics = [];
            }

            if (state.lastLoadedServerId === action.payload.agentId) {
                state.metrics = [...state.metrics, action.payload];
            }

            if ( state.metrics.length > MAX_METRIC_SIZE ) {
                state.metrics.shift();
            }


        },
        clearServerDetails: (state) => {
            state.metrics = [];
            state.loading = false;
            state.error = null;
            state.lastLoadedServerId = null;
            state.status = "idle";
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchServerDetails.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.status = "loading";
            })
            .addCase(fetchServerDetails.fulfilled, (state, action) => {
                console.log("serverDetailsSlice.js -> fetchServerDetails.fulfilled -> action.payload:", action.payload);
                state.loading = false;
                state.metrics = action.payload.metrics || [];
                state.lastLoadedServerId = action.payload.serverId;
                state.error = null
                state.status = "succeeded";
            })
            .addCase(fetchServerDetails.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || "Failed to load server details";
                state.status = "failed";
            });
    },
});

export const { updateServerDetailMetric, clearServerDetails } = serverDetailsSlice.actions;
export default serverDetailsSlice.reducer;

export const selectChartData = createSelector (
    (state) => state.serverDetails.metrics,
    (metrics) => {
        if (!metrics || metrics.length === 0) {
            return { cpu: [], memory: [], disk: [], network: [] };
        }

        return {
            cpu: metrics.map( m=> ({
                x: new Date(m.createdAt),
                y: m.cpu ? m.cpu.toFixed(2) : 0
            })),

            memory: metrics.map( m => ({
                x: new Date(m.createdAt),
                y: m.memUsed && m.memTotal
                    ? Math.round((m.memUsed / m.memTotal) * 100)
                    : 0
            })),

            disk: metrics.map( m => ({
                x: new Date(m.createdAt),
                y: m.diskUsed && m.diskTotal
                    ? Math.round((m.diskUsed / m.diskTotal) * 100)
                    : 0
            })),

            network: metrics.map( m => ({
                x: new Date(m.createdAt),
                y: (m.tx + m.rx).toFixed(2)
            })),
        };
    }
)