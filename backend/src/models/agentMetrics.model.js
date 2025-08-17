import mongoose from "mongoose";

const agentMetricsSchema = new mongoose.Schema({
    agentId: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Agent', 
        index: true, 
        required: true,
    },
    ts: {
        type: Date, 
        index: true, 
        required: true,
    },
    payload: {
        type: Object, 
        required: true,
    },
}, { strict: false })

// Auto-delete docs older than 30 days
agentMetricsSchema.index({ ts: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 30 });

export default mongoose.model('AgentMetric', agentMetricsSchema);