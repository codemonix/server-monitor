import mongoose from "mongoose";

const globalConfigSchema = new mongoose.Schema(
    {
        settingsKey: { type: String, required: true, unique: true, default: 'default'},
        pollingInterval: { type: Number, default: 5000 },
        batchMaxItems: { type: Number, default: 10 },
        retentionDays: { type: Number, default: 30 },
    },
    { timestamps: true }
);

export default mongoose.model("GlobalConfig", globalConfigSchema);