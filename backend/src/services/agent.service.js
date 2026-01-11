import Agent from '../models/Agent.model.js'


export async function getAgentsList() {
    try {
        const agents = await Agent.find();
        return agents
    } catch (error) {
        console.log("agent.service.js -> getAgentsList -> error:", error.message);
        throw error;
    }
}

export async function delAgent(id) {
    console.log("agent.service.js -> delAgent -> id:", id );
    await Agent.findByIdAndDelete(id)
}