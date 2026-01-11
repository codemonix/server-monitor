import mongoose from "mongoose";
import { version } from "systeminformation";

const agentSchema = new mongoose.Schema({
    name: String,
    host: String,
    ip: String,
    os: String,
    arch: String,
    version: String,
    cpuModel: String,
    tags: [String],
    status: {
        type: String,
        enum: ["online", "offline", "degraded"],
        default: "offline"
    },
    lastHeartbeatAt: Date,
    secretHash: String,
}, { timestamps: true })

export default mongoose.model("Agent", agentSchema);
