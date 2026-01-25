import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { BrowserRouter } from 'react-router-dom';

import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

import metricsReducer from '../redux/slices/metricSlice.js';
import serverDetailsReducer from '../redux/slices/serverDetailsSlice.js';
import metricPointsReducer from '../redux/slices/metricsPointsSlice.js';


export function renderWithProviders(
    ui,
    {
        preloadedState = {},
        // Create store if no store passed
        store = configureStore({
            reducer:{
                metrics: metricsReducer,
                serverDetails: serverDetailsReducer,
                metricPoints: metricPointsReducer
            },
            preloadedState,
        }),
        ...renderOptions
    } = {}
) {
    function Wrapper({ children }) {
        return (
            <Provider store={store}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <BrowserRouter >
                        {children}
                    </BrowserRouter>
                </LocalizationProvider>
            </Provider>
        );
    }
    return { store, ...render(ui, { wrapper: Wrapper, ...renderOptions }) }
    }
