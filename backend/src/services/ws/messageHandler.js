import { broadcastToDashboards } from "./broadcastManager.js";
import { insertMetricPoints } from "../metrics.service.js";
import logger from "../../utils/logger.js";

export function handleAgentMessage(agentId, message) {
    try {
        logger("messageHandler.js -> handleAgentMessage -> message:", message);
        // const data = JSON.parse(message);
        // logger("messageHandler.js -> handleAgentMessage -> data:", data)
        if (message.type === "metrics") {
            logger("messageHandler.js -> handleAgentMessage -> message type is metric.")
            broadcastToDashboards({
                type: 'metricUpdate',
                agentId,
                payload: message,
            });
            insertMetricPoints(message);
        }
    } catch (error) {
        logger("messageHandler.js -> fail to handle message from agentId:", agentId, error.message);
    }
}
