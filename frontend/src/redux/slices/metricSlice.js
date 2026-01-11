import { createSlice } from "@reduxjs/toolkit";
import { fetchServerStats } from "../thunks/metricsThunks.js";
import { getAgentStatus } from "../../utils/getAgentStatus.js"; 

const metricsSlice = createSlice({
    name: "metrics",
    initialState: {
        items: [],
        status: "idle",
    },
    reducers: {
        updateMetrics: (state, action) => {
            const { agentId, ...data } = action.payload;
            console.log("metricsSlice.js -> updateMetrics action.payload:", action.payload);
            
            const index = state.items.findIndex((item) => item.agentId === agentId);

            if (index >= 0) {
                console.log("metricsSlice.js -> updateMetrics -> updating existing item for agentId:", agentId);
                state.items[index] = { ...state.items[index], ...data };
                state.items[index].status = getAgentStatus(data);
                console.log("metricsSlice.js -> updateMetrics -> updated item:", state.items[index]);
            } else {
                state.items.push({ ...data });
            }

            // const newMetric = action.payload;
            // console.log("metricsSlice.js -> updateMetrics:", newMetric);
            // const index = state.items.findIndex((m) => m.id === newMetric.id);
            // if (index >= 0 ) state.items[index] = newMetric.id;
            // else state.items.push(newMetric);
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchServerStats.pending, (state) => {
                state.status = "loading";
            })
            .addCase(fetchServerStats.fulfilled, (state, action) => {
                state.items = action.payload.map((item) => {
                    return { ...item, status: getAgentStatus(item) };
                })
                state.status = "succeeded";
            })
            .addCase(fetchServerStats.rejected, (state) => {
                state.status = "failed";
            });
    },
});

export const { updateMetrics } = metricsSlice.actions;
export default metricsSlice.reducer;