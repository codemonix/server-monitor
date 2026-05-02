import { createTheme, type PaletteOptions } from "@mui/material/styles";

// Professional, eye-friendly palettes
const lightPalette = {
    mode: "light" as const,
    primary: { main: '#2563eb' }, // Modern robust blue
    secondary: { main: '#475569' },
    background: {
        default: '#f8fafc', // Soft slate off-white
        paper: '#ffffff',
    },
    text: {
        primary: '#0f172a',
        secondary: '#64748b',
    },
    divider: '#e2e8f0',
};

const darkPalette = {
    mode: "dark" as const,
    primary: { main: '#3b82f6' }, 
    secondary: { main: '#94a3b8' },
    background: {
        default: '#0b1120', // Deep midnight blue (easy on the eyes)
        paper: '#1e293b',   // Elevated slate for cards/panels
    },
    text: {
        primary: '#f1f5f9', // Off-white to prevent halation
        secondary: '#94a3b8',
    },
    divider: '#334155',
};

// Reusable component overrides for both themes
const components = {
    MuiCard: {
        styleOverrides: {
            root: {
                borderRadius: 12,
                backgroundImage: 'none', // Removes MUI's default elevation overlay in dark mode
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
            },
        },
    },
    MuiDataGrid: {
        styleOverrides: {
            root: {
                border: 'none',
                '& .MuiDataGrid-columnHeaders': {
                    borderBottom: '1px solid var(--DataGrid-rowBorderColor)',
                },
                '& .MuiDataGrid-cell': {
                    borderBottom: '1px solid var(--DataGrid-rowBorderColor)',
                },
            },
        },
    },
    MuiButton: {
        styleOverrides: {
            root: {
                textTransform: "none" as const,
                borderRadius: 8,
                fontWeight: 600,
            },
        },
    },
};

export const getTheme = (mode: string) =>
    createTheme({
    palette: (mode === "light" ? lightPalette : darkPalette) satisfies PaletteOptions,
    typography: {
        fontFamily: 'Inter, Roboto, "Helvetica Neue", Arial, sans-serif',
    },
    components,
});