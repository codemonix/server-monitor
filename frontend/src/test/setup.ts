import '@testing-library/jest-dom';

window.config = {
    API_BASE: 'http://localhost:4000/api',
    WS_BASE: 'http://localhost:4000/ws'
};

Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => {},
    }),
});