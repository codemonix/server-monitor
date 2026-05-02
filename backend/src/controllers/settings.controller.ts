import * as userService from '../services/user.service.js';
import * as settingsService from '../services/settings.service.js';
import logger from '../utils/logger.js';

// User profile
export async function changePassword(req, res) {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.sub;

    try {
        await userService.changeUserPassword(userId, currentPassword, newPassword);
        logger.debug("settings.controller.js -> changePassword -> password changed successfully", {userId});
        res.status(200).json({ message: 'Password changed successfully' });
    } catch (error) {
        logger.error("settings.controller.js -> changePassword ->", {error: error.message});
        const status = error.message.includes("Incorrect") ? 403 : 500;
        res.status(status).json({ error: error.message });
    }
}

// Global Agent config
export async function getGlobalConfig(req, res) {
    try {
        const config = await settingsService.fetchGloabalConfig();
        logger.info("settings.controller.js -> getGlobalConfig -> config loaded successfully");
        logger.debug("settings.controller.js -> getGlobalConfig -> config:", {config});
        res.json(config);
    } catch (error) {
        logger.error("settings.controller.js -> getDlobalConfig -> ", {error: error.message});
        res.status(500).json({ error: 'Failed to fetch global config'});
    }

}

export async function updateGlobalConfig(req, res) {
    logger.debug("settings.controller.js -> updateGlobalConfig -> req.body:", {body: req.body});
    try {
        const allowedFields = [
            'pollingInterval',
            'batchMaxItems',
            'retentionDays',
            'isDemoMode',
            'logLevel',
            'logToFile',
            'logRetentionDays',
            'logMaxFileSize'
        ];

        const updateFields: Record<string, unknown> = {};
        for (const field of allowedFields) {
            logger.debug("settings.controller.js -> updateGlobalConfig -> field:", {field});
            if (req.body[field] !== undefined) {
                updateFields[field] = req.body[field];
            }
        }

        logger.debug("settings.controller.js -> updateGlobalConfig -> updateFields:", {updateFields});


        const config = await settingsService.upsertGlobalConfig(updateFields);
        logger.info("settings.controller.js -> updateGlobalConfig -> config updated successfully");
        logger.debug("settings.controller.js -> updateGlobalConfig -> config:", {config});
        res.json(config);
    } catch (error) {
        logger.error("settings.controller.js -> updateGlobalConfig -> ", {error: error.message});
        res.status(500).json({ error: 'Failed to update global config'});
    }
}

export async function getPublicConfig(req, res) {
    try {
        const publicSettings = await settingsService.getPublicSettings();
        res.json(publicSettings)
    } catch (error) {
        logger.error("settings.controller.js -> getPublicConfig -> ", {error: error.message});
        res.status(500).json({ error: "failed to fetch public config" });
    }
}