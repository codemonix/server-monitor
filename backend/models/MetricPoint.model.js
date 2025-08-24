import mongoose from "mongoose";

const metricPointsSchema = new mongoose.Schema({
    agent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Agent",
        required: true
    },
    cpu: Number,
    memUsed: Number,
    rx: Number,
    diskUsed: Number,
    diskTotal: Number,
    load1: Number,
    load5: Number,
    load15: Number
}, { timestamps: true })

export default mongoose.model("MetricPoint", metricPointsSchema);