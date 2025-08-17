import mongoose from "mongoose";

const agentSchema = new mongoose.Schema(
    {
        name: {
            type: String, required: true, trim: true,
        },
        type: {
            type: String, enum: [ 'server', 'outline-vpn', 'other' ], default: 'other',
        },
        ip: {
            type: String, required: true,
        },
        port: {
            type: Number, default: 22,
        },
        apiToken: {
            type: String, index: true,
        },
        credentials: {
            username: {
                type: String, required: true,
            },
            password: {
                type: String,
            },
            privateKey: {
                type: String,
            },
        },
        status: {
            type: String, enum: [ 'online', 'offline', 'unknown' ], default: 'unknown',
        },
        lastCheck: {
            type: Date,
        },
        metadata: {
            type: mongoose.Schema.Types.Mixed,
        },
        tags: {
            type: Map, of: String,
        },
        lastSeenAt: { type: Date },
    },
    { timestamps: true }
);

export default mongoose.model('Agent', agentSchema);