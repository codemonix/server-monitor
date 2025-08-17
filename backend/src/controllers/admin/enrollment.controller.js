import crypto from 'crypto'
import EnrollmentKey from '../../models/enrollmentKey.model.js';
import logger from '../../utils/logger.js';

export async function generateKey(req, res, next) {
    try {
        const { expiresInHours = 24, note } = req.body || {};
        const key = 'enroll_' + crypto.randomBytes(8).toString('hex');
        const expiresAt = new Date(Date.now() + Number(expiresInHours) * 3600_000);

        const doc = await EnrollmentKey.create({
            key,
            createdBy: req.user?._id,
            expiresAt,
            note
        });

        res.json({ key: doc.key, expiresAt: doc.expiresAt, note: doc.note });
    } catch (error) {
        logger.error(" failed to generate enrollment key:", error.message);
        next(error);
    }
}

export async function listKeys(req, res, next) {
    try {
        const { includeExpired = 'false' } = req.query;
        const filter = includeExpired === 'true'
            ? {}
            : { expiresAt: { $gte: new Date() }};
        const keys = await EnrollmentKey.find(filter).sort({ createdAt: -1 }).limit(100);
        res.json( keys.map( k => ({
            id: k._id, key: k.key, used: k.used, createdAt: k.createdAt,
            expiresAt: k.expiresAt, usedAt: k.usedAt, note: k.note
        })));
    } catch (error) {
        logger.error(" failed to fetch keys:", error.message);
        next(error);
    }
}

export async function revokeKey(req, res, next) {
    try {
        const { id } = req.params;
        const doc = await EnrollmentKey.findById(id);
        if (!doc) return res.status(404),json({ message: " not found "});
        if (doc.used) return res.status(400).json({ message: "already used" });
        // Set expiredAt to now to invalidate used key
        doc.expiresAt = new Date();
        await doc.save();
        res.json({ message: "Revoked" });
    } catch (error) {
        logger.error("failed to rvoke key:", error.message);
        next(error);
    }
}