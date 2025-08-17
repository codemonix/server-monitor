import mongoose from "mongoose";


const enrollmentKeySchema = new mongoose.Schema({
    key: {
        type: String, required: true, unique: true, index: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId, ref: 'User'
    },
    createdAt: {
        type: Date, default: Date.now
    },
    expiresAt: {
        type: Date, required: true, index: true
    },
    used: {
        type: Boolean, default: false, index: true
    },
    usedAt: {
        type: Date
    },
    note: {
        type: String
    }
});

// Auto-delete when expiresAt is in the past
enrollmentKeySchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model('EnrollmentKey', enrollmentKeySchema);