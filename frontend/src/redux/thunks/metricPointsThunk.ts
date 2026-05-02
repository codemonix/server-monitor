import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api.js";
import { logger } from "../../utils/log.js";
import type { RootState } from "../store.js";

type FetchMetricPointsArg = {
    page?: number;
    pageSize?: number;
    filters?: RootState["metricPoints"]["filters"];
    sort?: RootState["metricPoints"]["sort"];
};

export const fetchMetricPoints = createAsyncThunk(
    "metricPoints/fetch",
    async (payload: FetchMetricPointsArg | undefined, thunkAPI) => {
        try {
            const state = thunkAPI.getState() as RootState;
            const page = payload?.page ?? state.metricPoints.page ?? 0;
            const pageSize = payload?.pageSize ?? state.metricPoints.pageSize ?? 50;
            const filters = payload?.filters ?? state.metricPoints.filters;
            const sort = payload?.sort ?? state.metricPoints.sort;
            const res = await api.post('/metrics', { page, pageSize, filters, sort }, {
                signal: thunkAPI.signal
            });
            logger.debug("metricPointsThunk.js -> fetchMetricPoints -> res.data:", res.data);
            return { items: res.data.items || [], total: res.data.total ?? 0, page, pageSize};

        } catch (error) {
            if (error.name === 'AbortError' || error.name === 'CanceledError') {
                logger.warn("metricPointsThunk.js -> fetchMetricPoints -> request canceled to prevent race condition")
                return thunkAPI.rejectWithValue('Aborted')
            }
            logger.error("metricPointsThunk.js -> fetchMetricPoints -> error:", error.message);
            return thunkAPI.rejectWithValue(error.message || "Failed to fetch metric points");
        }
    }
);