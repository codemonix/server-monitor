import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { listServers } from "../../services/api.js";
import { error } from "winston";


export const fetchServers = createAsyncThunk('servers/fetchServers', async () => {
    return await listServers();
});

const serevrsSlice = createSlice({
    name: 'servers',
    initialState: {
        items: [],
        status: 'idle',
        error: null
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchServers.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchServers.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.items = action.payload;
            })
            .addCase(fetchServers.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error?.message || 'Failed to fetch servers';
            });
    }
})

export default serevrsSlice.reducer;