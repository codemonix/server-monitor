import { configStore } from '@reduxjs/toolkit';
import serversReducer from './reducers/serversReducer.js';

const store = configStore({
    reducer:{
        servers: serversReducer,
    }
})

export default store;