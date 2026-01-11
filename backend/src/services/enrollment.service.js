import { logout } from '../controllers/auth.controller.js';
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
        const enrollment = await EnrollmentToken.findOne({ token });
        if (!enrollment) {
            logger("enrollment.service.js -> Enrollment token not found");
            return null;
        }
        if (enrollment.used) {
            logger("enrollment.service.js -> Enrollment token already used");
            return null;
        }

        if (enrollment.expiresAt < new Date()) {
            logout("enrollment.service.js -> Enrollment token expired");
            return null;
        }
        if (consume) {
            enrollment.used = true;
            await enrollment.save();
        }

        return enrollment;
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