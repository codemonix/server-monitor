import fs from 'fs';
import path from 'path';

const stateDir = '.agent-state';
const stateFile = path.join(stateDir, 'state.join');

export function loadState() {
    try {
        if (!fs.existsSync(stateDir)) fs.mkdirSync(stateDir, { recursive: true });
        if (!fs.existsSync(stateFile)) return {};
        return JSON.parse(fs.readFileSync(stateFile, 'utf8'));
    } catch { return {}; }
}

export function saveState(obj) {
    if (!fs.existsSync(stateDir)) fs.mkdirSync(stateDir, { recursive: true });
    fs.writeFileSync(stateFile, JSON.stringify(obj, null, 2));
}