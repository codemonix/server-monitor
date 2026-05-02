import type { JwtPayload } from "jsonwebtoken";
import { agentJwtService, verifyAccess } from "../jwt.service.js";
import logger from "../../utils/logger.js";

type AuthPayload = { role: string; id: string };

export async function authenticate(ws: unknown, token: string, role: string): Promise<AuthPayload> {
    if (role === "agent") {
        const payload = await agentJwtService.verifyAccess(token);
        logger.debug("auth.js -> authenticate[agent] ->", { payload });
        if (!payload || typeof payload === "string" || !("sub" in payload)) {
            throw new Error("Invalid agent token");
        }
        const p = payload as JwtPayload & { typ?: string; sub?: string };
        return { role: p.typ ?? "agent", id: String(p.sub) };
    }

    if (role === "dashboard") {
        const payload = verifyAccess(token) as JwtPayload & { typ?: string; sub?: string };
        logger.debug("auth.js -> authenticate[dashboard] ->", { payload });
        return { role: String(payload.typ), id: String(payload.sub) };
    }

    throw new Error("Unknown WebSocket role");
}