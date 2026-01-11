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
            const res = await api.post('/metrics', { page, pageSize, filters, sort });
            console.log("metricPointsThunk.js -> fetchMetricPoints -> res.data:", res.data);
            return { items: res.data.items || [], total: res.data.total ?? 0, page, pageSize}
        //     console.log("metricPointsThunk.js -> fetchMetricPoints -> filters:", payload);
        //     const response = await api.post('/metrics', payload );
        //     console.log("metricPointsThunk.js -> fetchMetricPoints -> response.data:", response.data);
        //     return response.data;
        // } catch (error) {
            // return rejectWithValue(error.response?.data || "Failed to fetch metric points");
        } catch (error) {
            console.error("metricPointsThunk.js -> fetchMetricPoints -> error:", error.message);
            return thunkAPI.rejectWithValue(error.message || "Failed to fetch metric points");
        }
    }
);