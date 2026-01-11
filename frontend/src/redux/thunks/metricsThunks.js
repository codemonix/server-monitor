import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api.js";

export const fetchServerStats = createAsyncThunk(
    "/metrics/fetchServerStats",
    async ( _, { rejectWithValue } ) =>{
        try {
            const res = await api.get('/servers/server-stat');
            console.log("metricsThunks.js -> fetchServerStats -> res.data:", Object.values(res.data));
            return res.data;
        } catch  (error) {
            return rejectWithValue(error.response?.data || "Failed to fetch stats");
        }
    }
)