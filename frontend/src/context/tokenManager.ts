import { logger } from "../utils/log.js";

let accessToken: string | null = null;
let accessTokenExpiry: number | null = null;

export const setAccessToken = (token: string, ttlSeconds: number): boolean => {
    if (
        typeof token === "string" &&
        token.trim() !== "" &&
        token !== "undefined" &&
        token !== "null"
    ) {
        accessToken = token;
        logger.debug("tokenManager -> setAccessToken - token set:", !!token);
        accessTokenExpiry = Date.now() + (ttlSeconds ? ttlSeconds * 1000 : 15 * 60 * 1000);
        return true;
    }
    logger.warn("Invalid token, abort setting to memory");
    return false;
};

export const getAccessToken = (): { token: string | null; expiry: number | null } => {
    logger.info("tokenManager -> getAccessToken -> accessToken:", !!accessToken);
    if (typeof accessToken !== "string" || !accessToken || !accessToken.includes(".")) {
        return { token: null, expiry: null };
    }
    return { token: accessToken, expiry: accessTokenExpiry };
};

export const clearAccessToken = () => {
    accessToken = null;
    accessTokenExpiry = null;
};
