import mongoose from "mongoose";

const metricPointsSchema = new mongoose.Schema({
    agent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Agent",
        required: true
    },
    ts: { type: Date, required: true }, 
    cpu: Number,
    memUsed: Number,
    memTotal: Number,
    rx: Number,
    tx: Number,
    diskUsed: Number,
    diskTotal: Number,
    load1: Number,
    load5: Number,
    load15: Number,
    upTime: Number,

    memPercent: { type: Number },
    diskPercent: { type: Number },
}, { timestamps: true })

metricPointsSchema.index({ agent: 1, ts: -1 });
metricPointsSchema.index({ ts: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 30 }); // 30 days TTL
metricPointsSchema.index({ memPercent: 1 });
metricPointsSchema.index({ diskPercent: 1 });

export default mongoose.model("MetricPoint", metricPointsSchema);