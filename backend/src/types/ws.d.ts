declare module "ws" {
    interface WebSocket {
        isAuthenticated?: boolean;
        clearAuthTimer?: () => void;
    }
}

export {};
