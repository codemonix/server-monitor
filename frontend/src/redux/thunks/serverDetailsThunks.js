import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api.js";

export const fetchServerDetails = createAsyncThunk(
    "serverDetails/fetchServerDetails",
    async (serverId, { rejectWithValue }) => {
        try {
            const res = await api.get(`/servers/${serverId}/metrics`);
            console.log(" serverDetailsThink -> res.data:", res.data.points)
            return {
                serverId,
                metrics: res.data.points
            }
        } catch (error) {
            return rejectWithValue(error.response?.data || "Failed to fetch server details.");
        }
    }
);