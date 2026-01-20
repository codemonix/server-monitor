import { createSlice} from '@reduxjs/toolkit';

const getInitialTheme = () => {
    const savedTheme = localStorage.getItem('themeMode');
    if (savedTheme) return savedTheme;
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};


const initialState = {
    themeMode: getInitialTheme(),
    refereshInterval: Number(localStorage.getItem('refreshInterval')) || 10000,
};

const settingSlice = createSlice({
    name: 'settings',
    initialState,
    reducers: {
        toggleTheme: (state) => {
            state.themeMode = state.themeMode === 'light' ? 'dark' : 'light';
            localStorage.setItem('themeMode', state.themeMode);
        },
        setRefreshInterval: (state, action) => {
            state.refereshInterval = Number(action.payload);
            localStorage.setItem('refreshInterval', action.payload);
        }
    }
});

export const { toggleTheme, setRefreshInterval } = settingSlice.actions;
export default settingSlice.reducer;