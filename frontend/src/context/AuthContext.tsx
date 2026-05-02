import { createContext, useContext, type ReactNode } from "react";

export type AuthUser = {
    id: string;
    email: string;
    role: string;
    _id?: string;
} | null;

export type AuthContextType = {
    user: AuthUser;
    loading: boolean;
    accessToken: string | null;
    login: (email: string, password: string) => Promise<{
        user: NonNullable<AuthUser>;
        accessToken: string;
        ttl: number;
    }>;
    logout: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = (): AuthContextType => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within AuthProvider");
    return ctx;
};
