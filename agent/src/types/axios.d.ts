import "axios";

declare module "axios" {
    interface InternalAxiosRequestConfig {
        _useRefreshToken?: boolean;
    }

    interface AxiosRequestConfig {
        _useRefreshToken?: boolean;
    }
}

export {};
