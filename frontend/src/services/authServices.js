import { logger } from "../utils/log.js";
import api from "./api.js";

/**
 * 
 * @param {string} email 
 * @param {string} password 
 * @returns { {user: { id, role, email }, accessToken: string, ttl: number} }
 */

export const loginApi = async ( email, password ) => {
    try {
        const { data } = await api.post('/auth/login', { email, password });
        logger.debug("login successful:", data.user.email);
        return { user: data.user, accessToken: data.access, ttl: data.ttl };
    } catch ( error ) {
        logger.error("login failed:", error.message);
    }
}

/**
 * 
 * @returns {{ accessToken: string, ttl: number, user: { id: string, role: string, email: string } | undefined }}
 */

export const refreshTokenApi = async () => {
    try {
        const { data } = await api.post('/auth/refresh-token');
        logger.debug("refreshTokenApi -> token refreshed", !!data.access);
        return { accessToken: data.access, ttl: data.ttl, user: data.user };
    } catch ( error ) {
        logger.error("authServices.js -> rereshTokenApi -> token refresh failed:", error.message);
    }
}

export const logoutApi = async () => {
    try {
        await api.post('/auth/logout');
        logger.info("logout successful");
    } catch ( error ) {
        logger.error("authServices.js -> logoutApi -> logout failed:", error.message);
    }
}
