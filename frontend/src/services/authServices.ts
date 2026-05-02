import { logger } from "../utils/log.js";
import api from "./api.js";

export type AuthResponse = {
    user: { id: string; role: string; email: string };
    accessToken: string;
    ttl: number;
};

export const loginApi = async (email: string, password: string): Promise<AuthResponse> => {
    try {
        const { data } = await api.post("/auth/login", { email, password });
        logger.debug("login successful:", data.user.email);
        return { user: data.user, accessToken: data.access, ttl: data.ttl };
    } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : String(error);
        logger.error("login failed:", msg);
        throw error;
    }
};

export const refreshTokenApi = async (): Promise<AuthResponse | undefined> => {
    try {
        const { data } = await api.post("/auth/refresh-token");
        logger.debug("refreshTokenApi -> token refreshed", !!data.access);
        return { accessToken: data.access, ttl: data.ttl, user: data.user };
    } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : String(error);
        logger.error("authServices.js -> rereshTokenApi -> token refresh failed:", msg);
        return undefined;
    }
};

export const logoutApi = async () => {
    try {
        await api.post("/auth/logout");
        logger.info("logout successful");
    } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : String(error);
        logger.error("authServices.js -> logoutApi -> logout failed:", msg);
    }
};
