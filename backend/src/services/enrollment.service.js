
import EnrollmentToken from '../models/EnrollmentToken.model.js';
import logger from '../utils/logger.js';
import crypto from 'crypto';


function randToken(bytes = 24) {
    return crypto.randomBytes(bytes).toString('hex');
}

/**
 * 
 * @param {string} createdBy 
 * @param {number} ttlMin 
 * @returns {Promise<EnrollmentToken>}
 */

export async function generateEnrollToken(createdBy, ttlMin = 60) {
    const token = randToken();
    const expiresAt = new Date(Date.now() + ttlMin * 60 * 1000);
    const enrollmentToken = await EnrollmentToken.create({ token, createdBy, expiresAt });
    logger("enrollment.service.js -> Generated enrollment token:", enrollmentToken);
    return enrollmentToken;
}


/**
 * 
 * @param {string} token 
 * @param {boolean} consume 
 * @returns {Promise<EnrollmentToken|null>}
 */

export async function verifyEnrollmentToken(token, consume = true) {
    try {

        const query = {
            token,
            used: false,
            expiresAt: { $gt: new Date() },
        };

        if (consume) {
            const enrollment = await EnrollmentToken.findOneAndUpdate(
                query,
                { $set: { used: true } },
                { new: true }
            );
            if (!enrollment) {
                logger("enrollment.service.js -> verifyEnrollmentToken -> Enrollment token not found or already used");
                return null;
            }
            return enrollment;
        } else {
            // pick without consuming
            return await EnrollmentToken.findOne(query);
        }
    } catch (error) {
        logger("enrollment.service.js -> Error verifying enrollment token:", error.message);
        return null;
    }
}

export async function getEnrollmentTokensList() {
    try {
        const enrollmentTokens = await EnrollmentToken.find();
        return enrollmentTokens
    } catch (error) {
        logger("enrollment.service.js -> getEnrollmentTokensList -> error:", error.message);
        throw error;
    }

}