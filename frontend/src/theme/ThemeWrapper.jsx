import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { getTheme } from './index.js';

export default function ThemeWrapper({ children }) {
    const themeMode = useSelector((state) => state.settings.themeMode);
    
    // Memoize the theme creation so it only recalculates when themeMode changes
    const theme = useMemo(() => getTheme(themeMode), [themeMode]);

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            {children}
        </ThemeProvider>
    );
}