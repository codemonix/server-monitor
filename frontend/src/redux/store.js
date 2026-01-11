import { configureStore } from '@reduxjs/toolkit';
import metricsReducer from "./slices/metricSlice.js";
import serverDetailsReducer from "./slices/serverDetailsSlice.js";
import metricPointsReducer from "./slices/metricsPointsSlice.js";


const store = configureStore({
    reducer:{
        metrics: metricsReducer,
        serverDetails: serverDetailsReducer,
        metricPoints: metricPointsReducer,
    },
    // devTools: import.meta.env.MODE !== "production",
})

export default store;