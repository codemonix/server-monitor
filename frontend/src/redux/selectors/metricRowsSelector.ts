import { createSelector } from "@reduxjs/toolkit";

export const selectAgentsMap = createSelector(
    state => state.metrics.items || [],
    agents => {
        const map = new Map();
        for (const agent of agents) {
            map.set(String(agent._id), agent.name || agent.host || "Unnamed Agent");
        }
        return map;
    }
);

export const selectMetricRows = createSelector(
    state => state.metricPoints.items || [],
    selectAgentsMap,
    (metricPoints, agentsMap) => {
        return metricPoints.map( metric => {
            const memPercent = ( metric.memPercent != null ) ? metric.memPercent.toFixed(2) : (metric.memTotal ? Number((metric.memUsed / metric.memTotal * 100).toFixed(2)) : null);
            const diskPercent = ( metric.diskPercent != null ) ? metric.diskPercent.toFixed(2) : (metric.diskTotal ? Number((metric.diskUsed / metric.diskTotal * 100).toFixed(2)) : null);

            return {
                ...metric,
                agentName: agentsMap.get(String(metric.agentId)) || metric.agentName || "Unnamed Agent",
                memPercent,
                diskPercent,
                tsFormatted: metric.ts ? new Date(metric.ts).toLocaleString() : "N/A",
            };
        });
    }
)