import mongoose from "mongoose";

const globalConfigSchema = new mongoose.Schema(
    {
        settingsKey: { type: String, required: true, unique: true, default: 'default'},
        pollingInterval: { type: Number, default: 5000 },
        batchMaxItems: { type: Number, default: 10 },
        retentionDays: { type: Number, default: 30 },   
        isDemoMode: { type: Boolean, default: false},

        // Logging settings
        logLevel: { type: String, default: 'info', enum: ['error', 'warn', 'info', 'http', 'debug']},
        logToFile: { type: Boolean, default: true },
        logRetentionDays: { type: String, default: '14d' },
        logMaxFileSize: { type: String, default: '20m' }
    },
    { timestamps: true }
);

export default mongoose.model("GlobalConfig", globalConfigSchema);