import GlobalConfig from '../models/GlobalConfig.model.js';
import logger from '../utils/logger.js';




export async function fetchGloabalConfig() {
    let config = await GlobalConfig.findOne({ settingsKey: 'default' });
    if (!config) {
        config = await GlobalConfig.create({ settingsKey: 'default' });   
    }
    return config;
}

export async function upsertGlobalConfig(updates) {
    const config = await GlobalConfig.findOneAndUpdate(
        { settingsKey: 'default' },
        updates,
        { upsert: true, new: true }
    )
}