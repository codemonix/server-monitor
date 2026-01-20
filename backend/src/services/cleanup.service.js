import corn from 'node-cron';
import MetricPoints from '../models/MetricPoint.model.js';
import GlobalConfig from '../models/GlobalConfig.model.js';
import logger from '../utils/logger.js';

export function startCleanupJob() {
    corn.schedule("0 0 0 * * *", async () => {
        logger("cleanup.service.js -> Startingdaily data cleanup ...");
        try {
            const config = await GlobalConfig.findOne({ settingsKey: 'default' });
            const days = config?.retentionDays || 30;

            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - days);

            const result = await MetricPoints.deleteMany({ ts: { $lt: cutoffDate } });
            logger(`cleanup.service.js -> Cleanup complete. Deleted ${result.deletedCount} metrics olser than ${days} days. `);

        } catch (error) {
            logger("cleanup.service.js -> error:", error.message);
        }
    })
}