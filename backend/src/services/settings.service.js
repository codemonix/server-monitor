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
    console.log("upsertGlobalConfig -> updates:", updates);
    const config = await GlobalConfig.findOneAndUpdate(
        { settingsKey: 'default' },
        updates,
        { upsert: true, new: true }
    )
}

export async function getPublicSettings() {
    const config = await GlobalConfig.findOne({ settingsKey: 'default'}).lean();

    return {
        isDemoMode: config?.isDemoMode || false
    };
}

export async function updatePublicSettings(data) {
    const config = await GlobalConfig.findOneAndUpdate(
        { settingsKey: 'default' },
        { $set: data },
        { new: true, upsert: true }
    );
    return config;

}