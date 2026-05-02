import { getDashboards } from "./wsRegistry.js";
import logger from "../../utils/logger.js";




function transformMetricData(data) {
    if (data.type === 'metricUpdate') {
        const timestamp = data.payload.ts;

        const createdAt = new Date(timestamp).toISOString();

        const newPayload = {
            ...data.payload,
            createdAt: createdAt,
        };

        return {
            ...data,
            payload: newPayload,
        };
    }

    return data;
}

export function broadcastToDashboards(data) {

    const transformedData = transformMetricData(data);


    // console.log("broadcastManager.js -> broadcastToDashboards -> data:", transformedData);
    const dashboards = getDashboards();
    logger.debug("broadcastManager.js -> broadcasting to dashboards", {count: dashboards.size});
    const json = JSON.stringify(transformedData);
    
    logger.debug("brodcastManager.js -> broadcasting data -> outside if:", {json})

    for ( const ws of dashboards ) {
        if ( ws.readyState === ws.OPEN ) {
            logger.debug("brodcastManager.js -> broadcasting data -> inside if:", {json})
            ws.send(json);
        }
    }
}