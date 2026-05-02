/// <reference types="vite/client" />

interface WindowConfig {
    API_BASE_URL?: string;
    WS_BASE_URL?: string;
    API_BASE?: string;
    WS_BASE?: string;
    IS_DEMO?: boolean;
}

declare global {
    interface Window {
        config?: WindowConfig;
    }
}

export {};
