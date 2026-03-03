import { createAsyncThunk } from "@reduxjs/toolkit";
import api  from "../../services/api";


export const fetchMetricPoints = createAsyncThunk(
    'metricPoints/fetch',
    async ( payload, thunkAPI ) => {
        try {
            const state = thunkAPI.getState();
            const page = payload?.page ?? state.metricPoints.page ?? 0;
            const pageSize = payload?.pageSize ?? state.metricPoints.pageSize ?? 50;
            const filters = payload?.filters ?? state.metricPoints.filters;
            const sort = payload?.sort ?? state.metricPoints.sort;
            const res = await api.post('/metrics', { page, pageSize, filters, sort }, {
                signal: thunkAPI.signal
            });
            console.log("metricPointsThunk.js -> fetchMetricPoints -> res.data:", res.data);
            return { items: res.data.items || [], total: res.data.total ?? 0, page, pageSize}
        //     console.log("metricPointsThunk.js -> fetchMetricPoints -> filters:", payload);
        //     const response = await api.post('/metrics', payload );
        //     console.log("metricPointsThunk.js -> fetchMetricPoints -> response.data:", response.data);
        //     return response.data;
        // } catch (error) {
            // return rejectWithValue(error.response?.data || "Failed to fetch metric points");
        } catch (error) {
            if (error.name === 'AbortError' || error.name === 'CanceledError') {
                console.log("metricPointsThunk.js -> fetchMetricPoints -> request canceled to prevent race condition")
                return thunkAPI.rejectWithValue('Aborted')
            }
            console.error("metricPointsThunk.js -> fetchMetricPoints -> error:", error.message);
            return thunkAPI.rejectWithValue(error.message || "Failed to fetch metric points");
        }
    }
);