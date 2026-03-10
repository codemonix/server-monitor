import { broadcastToDashboards } from "./broadcastManager.js";
import { insertMetricPoints } from "../metrics.service.js";
import logger from "../../utils/logger.js";

export function handleAgentMessage(agentId, message) {
    try {
        logger.info("messageHandler.js -> handleAgentMessage -> handlung message from agent");
        if (message.type === "metrics") {
            logger.debug("messageHandler.js -> handleAgentMessage -> message type is metric.")
            broadcastToDashboards({
                type: 'metricUpdate',
                agentId,
                payload: message,
            });
            insertMetricPoints(message);
        }
    } catch (error) {
        logger.error("messageHandler.js -> fail to handle message from", {agentId}, {error: error.message});
    }
}
