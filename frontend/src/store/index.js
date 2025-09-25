import { configureStore } from '@reduxjs/toolkit';
import serversReducer from './slices/serversSlice.js';

const store = configureStore({
    reducer:{
        servers: serversReducer,
    }
})

export default store;