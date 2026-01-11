import { logger } from "../utils/log.js";

let accessToken = null;
let accessTokenExpiry = null; //in ms

/**
 * 
 * @param {string} token 
 * @param {number} ttlSeconds 
 * @returns {boolean} true if token is valid and set, false otherwise
 */

export const setAccessToken = ( token, ttlSeconds ) => {
    if (
        typeof token === 'string' &&
        token.trim() !== '' &&
        token !== 'undefined' &&
        token !== 'null'
    ) {
        accessToken = token;
        // console.log("tokenManager -> setAccessToken - token set:", token);
        logger.debug("tokenManager -> setAccessToken - token set:", !!token);
        accessTokenExpiry = Date.now() + ( ttlSeconds ? ttlSeconds * 1000 : 15 * 60 * 1000 );
        return true;
    }
    console.warn("Invalid token, abort setting to memory")
    return false;
};


/**
 * 
 * @returns {{ token: string|null, expiry: number|null }}
 */

export const getAccessToken = () => {
    console.log("tokenManager -> getAccessToken -> accessToken:", accessToken)
    if (
        typeof accessToken !== 'string' ||
        !accessToken ||
        !accessToken.includes('.')
    ) {
        return { token: null, expiry: null};
    }
    return { token: accessToken, expiry: accessTokenExpiry };
}

export const clearAccessToken = () => {
    accessToken = null;
    accessTokenExpiry = null;
};