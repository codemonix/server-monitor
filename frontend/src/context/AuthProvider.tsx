import { useState, useEffect, useRef, type ReactNode } from "react";
import { AuthContext, type AuthUser } from "./AuthContext.js";
import { loginApi, refreshTokenApi, logoutApi } from "../services/authServices.js";
import { getAccessToken, setAccessToken as setTokenManagerAccessToken, clearAccessToken } from "./tokenManager.js";
import { logger } from "../utils/log.js";
import { useNavigate } from "react-router-dom";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [userState, setUserState] = useState<AuthUser>(null);
    const [accessToken, setAccessTokenState] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const refresTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const navigate = useNavigate();

    // try refresh on load
    useEffect(() => {
        ( async () => {
            try {
                const refreshed = await refreshTokenApi();
                logger.debug("AuthProvider -> initial", refreshed?.user);

                if (refreshed?.accessToken && refreshed.ttl) {
                    setTokenManagerAccessToken(refreshed.accessToken, refreshed.ttl);
                    setAccessTokenState(refreshed.accessToken);
                    setUserState(refreshed.user);
                } else {
                    clearAccessToken();
                    setAccessTokenState(null);
                    setUserState(null);
                    navigate("/login", { replace: true });
                    logger.info("No valid token on initial refresh");
                }
            } catch (error: unknown) {
                clearAccessToken();
                setAccessTokenState(null);
                setUserState(null);
                navigate("/login", { replace: true });
                logger.error("AuthProvider.js -> useEffect -> Initial token refresh failed:", error);
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

        refresTimerRef.current = setTimeout(async () => {
            try {
                const refreshed = await refreshTokenApi();

                if (refreshed?.accessToken && refreshed.ttl) {
                    setTokenManagerAccessToken(refreshed.accessToken, refreshed.ttl);
                    setAccessTokenState(refreshed.accessToken);
                    setUserState(refreshed.user);
                    logger.info("Token refreshed proactively");
                } else {
                    clearAccessToken();
                    setAccessTokenState(null);
                    setUserState(null);
                    logger.info("No valid token on proactive refresh");
                }
            } catch (error: unknown) {
                const msg = error instanceof Error ? error.message : String(error);
                logger.error("Proactive token refresh failed:", msg);
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
    const login = async (email: string, password: string) => {
        const { user, accessToken, ttl } = await loginApi(email, password);
        setUserState(user);
        if (!accessToken || !ttl) {
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
        } catch (error: unknown) {
            const msg = error instanceof Error ? error.message : String(error);
            logger.warn("Logout failed:", msg);
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

