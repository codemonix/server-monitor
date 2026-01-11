import { useState, useEffect, useRef } from "react";
import { AuthContext } from "./AuthContext.jsx";
import { loginApi, refreshTokenApi, logoutApi } from "../services/authServices.js";
import { getAccessToken, setAccessToken as setTokenManagerAccessToken, clearAccessToken } from "./tokenManager.js";
import { logger } from "../utils/log.js";
import { useNavigate } from "react-router-dom";


export const AuthProvider = ({ children }) => {
    const [ userState, setUserState ] = useState( null );
    const [ accessToken, setAccessTokenState ] = useState( null );
    const [ loading, setLoading ] = useState(true);
    const refresTimerRef = useRef(null);
    const navigate = useNavigate();

    // try refresh on load
    useEffect(() => {
        ( async () => {
            try {
                const { user, accessToken, ttl } = await refreshTokenApi();
                console.log("AuthProvider -> initial", user );
                
                if ( accessToken && ttl ) {
                    setTokenManagerAccessToken(accessToken, ttl);
                    setAccessTokenState(accessToken);
                    setUserState(user);
                } else {
                    // no valid token
                    clearAccessToken();
                    setAccessTokenState(null);
                    setUserState(null);
                    navigate('/login', { replace: true });
                    logger.info("No valid token on initial refresh");
                }
            } catch (error) {
                clearAccessToken();
                setAccessTokenState(null);
                setUserState(null);
                navigate('/login', { replace: true });
                logger.info("AuthProvider.js -> useEffect -> Initial token refresh failed:", error);
            } finally {
                setLoading(false);
            }
        })();
    },[]);

    // proactive token refresh
    useEffect(() => {
        
        // clear previous timer
        if ( refresTimerRef.current ) {
            clearTimeout(refresTimerRef.current);
            refresTimerRef.current = null;
        }


        const { token , expiry } = getAccessToken();
        if ( !token || !expiry ) return;

        const delay = expiry - Date.now() - 60_000; // refresh 1 min early
        if ( delay <= 0 ) return; // already expired or about to expire

        refresTimerRef.current = setTimeout( async () => {
            try {
                const { user, accessToken, ttl } = await refreshTokenApi();

                if ( accessToken && ttl ) {
                    setTokenManagerAccessToken(accessToken, ttl);
                    setAccessTokenState(accessToken);
                    setUserState(user);
                    logger.info("Token refreshed proactively");
                } else {
                    // no valid token
                    clearAccessToken();
                    setAccessTokenState(null);
                    setUserState(null);
                    logger.info("No valid token on proactive refresh");
                }
            } catch (error) {
                logger.error("Proactive token refresh failed:", error.message);
                clearAccessToken();
                setAccessTokenState(null);
                setUserState(null);
            }
        }, delay );


        return () => {
            if ( refresTimerRef.current ) {
                clearTimeout(refresTimerRef.current);
                refresTimerRef.current = null;
            }
        }
    },[accessToken]);

    /**
     * @param {String} email 
     * @param {String} password
     * @returns { {user: { id, role, email }, accessToken: string, ttl: number} }
     */
    const login =  async ( email, password ) => {
        const { user, accessToken, ttl } = await loginApi( email, password );
        setUserState(user);
        if ( !accessToken || !ttl ) {
            throw new Error("No access token received");
        }

        setTokenManagerAccessToken(accessToken, ttl);
        setAccessTokenState(accessToken);
        setUserState(user);
        return { user, accessToken, ttl };
    };

    const logout = async () => {
        try {
            await logoutApi();
            setUserState(null);
            clearAccessToken();
        } catch ( error ) {
            logger.warn("Logout failed:", error.message);
        } finally {
            clearAccessToken();
            setUserState(null);
            setAccessTokenState(null);
        }
    };

    return (
        <AuthContext.Provider value={{ user: userState, login, logout, loading, accessToken }}>
            {children}
        </AuthContext.Provider>
    )
}

