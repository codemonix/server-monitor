import * as userService from '../services/user.service.js';
import * as settingsService from '../services/settings.service.js';
import logger from '../utils/logger.js';

// User profile
export async function changePassword(req, res) {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.sub;

    try {
        await userService.changeUserPassword(userId, currentPassword, newPassword);
        res.status(200).json({ message: 'Password changed successfully' });
    } catch (error) {
        logger("user.controller.js -> changePassword -> error:", error.message);
        const status = error.message.includes("Incorrect") ? 403 : 500;
        res.status(status).json({ error: error.message });
    }
}

// Global Agent config
export async function getGlobalConfig(req, res) {
    try {
        const config = await settingsService.fetchGloabalConfig();
        res.json(config);
    } catch (error) {
        logger("user.controller.js -> getDlobalConfig -> error:", error.message);
        res.status(500).json({ error: 'Failed to fetch global config'});
    }

}

export async function updateGlobalConfig(req, res) {
    try {
        const { pollingInterval, batchMaxItems } = req.body;
        const config = await settingsService.upsertGlobalConfig({ pollingInterval, batchMaxItems });
        res.json(config);
    } catch (error) {
        logger("user.controller.js -> updateGlobalConfig -> error:", error.message);
        res.status(500).json({ error: 'Failed to update global config'});
    }
}