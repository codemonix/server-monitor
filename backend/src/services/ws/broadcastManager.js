import { getDashboards } from "./wsRegistery.js";


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


    console.log("broadcastManager.js -> broadcastToDashboards -> data:", transformedData);
    const dashboards = getDashboards();
    console.log("broadcastManager.js -> broadcasting to dashboards count:", dashboards.size);
    const json = JSON.stringify(transformedData);
    
    console.log("brodcastManager.js -> broadcasting data -> outside if:", json)

    for ( const ws of dashboards ) {
        if ( ws.readyState === ws.OPEN ) {
            console.log("brodcastManager.js -> broadcasting data -> inside if:", json)
            ws.send(json);
        }
    }
}