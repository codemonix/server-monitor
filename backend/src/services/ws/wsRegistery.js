const agents = new Map();
const dashboards = new Set();

export function addAgent(id, ws) { agents.set(id, ws) };

export function removeAgent(id) { agents.delete(id) };

export function addDashboard(ws) { dashboards.add(ws) };

export function removeDashboard(ws) { dashboards.delete(ws) };

export function getAgents() { return agents };

export function getDashboards() { return dashboards };

export function getAgent(id) { return agents.get(id) };
