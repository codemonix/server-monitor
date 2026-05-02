import type { JwtPayload } from "jsonwebtoken";
import type { Document, Types } from "mongoose";

declare global {
    namespace Express {
        interface Request {
            user?: JwtPayload & { sub?: string; role?: string; typ?: string };
            agent?: (Document & { _id: Types.ObjectId }) | null;
        }
    }
}

export {};
