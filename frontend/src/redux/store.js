import { configureStore } from '@reduxjs/toolkit';
import metricsReducer from "./slices/metricSlice.js";
import serverDetailsReducer from "./slices/serverDetailsSlice.js";
import metricPointsReducer from "./slices/metricsPointsSlice.js";
import settingsReducer from "./slices/settingsSlice.js";


const store = configureStore({
    reducer:{
        metrics: metricsReducer,
        serverDetails: serverDetailsReducer,
        metricPoints: metricPointsReducer,
        settings: settingsReducer,
    },
    
})

export default store;