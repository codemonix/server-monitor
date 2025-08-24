import { configStore } from '@reduxjs/toolkit';
import serversReducer from './slices/serversSlice.js';

const store = configStore({
    reducer:{
        servers: serversReducer,
    }
})

export default store;