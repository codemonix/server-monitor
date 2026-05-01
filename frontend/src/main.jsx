import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { AuthProvider } from './context/AuthProvider.jsx';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import ThemeWrapper from './theme/ThemeWrapper.jsx';
import store from './redux/store.js';
import App from './App.jsx';
import './index.css';



createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <ThemeWrapper>
          <AuthProvider >
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <App />
            </LocalizationProvider>
          </AuthProvider>
        </ThemeWrapper>  
      </BrowserRouter>
    </Provider>
  </StrictMode>
)
