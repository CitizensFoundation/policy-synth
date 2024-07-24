import express from "express";
import { AgentQueueManager } from "@policysynth/agents/operations/agentQueueManager.js";
import { AgentCostManager } from "@policysynth/agents/operations/agentCostsManager.js";
import { AgentManager } from "@policysynth/agents/operations/agentManager.js";
import { AgentConnectorManager } from "@policysynth/agents/operations/agentConnectorManager.js";
import { AgentRegistryManager } from "@policysynth/agents/operations/agentRegistryManager.js";
import { PsAiModel } from "@policysynth/agents/dbModels/aiModel.js";
export class AgentsController {
    path = "/api/agents";
    router = express.Router();
    wsClients = new Map();
    agentQueueManager;
    agentCostManager;
    agentManager;
    agentConnectorManager;
    agentRegistryManager;
    constructor(wsClients) {
        this.wsClients = wsClients;
        this.agentQueueManager = new AgentQueueManager();
        this.agentCostManager = new AgentCostManager();
        this.agentManager = new AgentManager();
        this.agentConnectorManager = new AgentConnectorManager();
        this.agentRegistryManager = new AgentRegistryManager();
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.get(this.path + "/:id", this.getAgent);
        this.router.put(this.path + "/:agentId/:nodeType/:nodeId/configuration", this.updateNodeConfiguration);
        this.router.post(this.path + "/:id/control", this.controlAgent);
        this.router.get(this.path + "/:id/status", this.getAgentStatus);
        this.router.get(this.path + "/:id/costs", this.getAgentCosts);
        this.router.get(this.path + "/registry/agentClasses", this.getActiveAgentClasses);
        this.router.get(this.path + "/registry/connectorClasses", this.getActiveConnectorClasses);
        this.router.get(this.path + "/registry/aiModels", this.getActiveAiModels);
        this.router.post(this.path, this.createAgent);
        this.router.post(this.path + "/:agentId/outputConnectors", this.createOutputConnector);
        this.router.post(this.path + "/:agentId/inputConnectors", this.createInputConnector);
        this.router.put(this.path + "/:nodeId/:nodeType/configuration", this.updateNodeConfiguration);
        this.router.get(this.path + "/:id/ai-models", this.getAgentAiModels);
        this.router.delete(this.path + "/:agentId/ai-models/:modelId", this.removeAgentAiModel);
        this.router.post(this.path + "/:agentId/ai-models", this.addAgentAiModel);
    }
    getAgent = async (req, res) => {
        try {
            const agent = await this.agentManager.getAgent(req.params.id);
            res.json(agent);
        }
        catch (error) {
            console.error("Error in getAgent:", error);
            res.status(500).send("Internal Server Error");
        }
    };
    getAgentAiModels = async (req, res) => {
        try {
            const aiModels = await this.agentManager.getAgentAiModels(parseInt(req.params.id));
            res.json(aiModels);
        }
        catch (error) {
            console.error("Error fetching agent AI models:", error);
            res.status(500).send("Internal Server Error");
        }
    };
    removeAgentAiModel = async (req, res) => {
        try {
            await this.agentManager.removeAgentAiModel(parseInt(req.params.agentId), parseInt(req.params.modelId));
            res.json({ message: "AI model removed successfully" });
        }
        catch (error) {
            console.error("Error removing agent AI model:", error);
            res.status(500).send("Internal Server Error");
        }
    };
    addAgentAiModel = async (req, res) => {
        try {
            const { modelId, size } = req.body;
            await this.agentManager.addAgentAiModel(parseInt(req.params.agentId), modelId, size);
            res.status(201).json({ message: "AI model added successfully" });
        }
        catch (error) {
            console.error("Error adding agent AI model:", error);
            res.status(500).send("Internal Server Error");
        }
    };
    updateNodeConfiguration = async (req, res) => {
        const nodeType = req.params.nodeType;
        const nodeId = parseInt(req.params.nodeId);
        const updatedConfig = req.body;
        try {
            if (nodeType === "agent") {
                await this.agentManager.updateAgentConfiguration(nodeId, updatedConfig);
            }
            else if (nodeType === "connector") {
                await this.agentConnectorManager.updateConnectorConfiguration(nodeId, updatedConfig);
            }
            else {
                return res.status(400).send("Invalid node type");
            }
            res.json({ message: `${nodeType} configuration updated successfully` });
        }
        catch (error) {
            console.error(`Error updating ${nodeType} configuration:`, error);
            res.status(500).send("Internal Server Error");
        }
    };
    createInputConnector = async (req, res) => {
        this.createConnector(req, res, "input");
    };
    createOutputConnector = async (req, res) => {
        this.createConnector(req, res, "output");
    };
    createConnector = async (req, res, type) => {
        const { agentId } = req.params;
        const { connectorClassId, name } = req.body;
        if (!agentId || !connectorClassId || !name || !type) {
            return res
                .status(400)
                .send("Agent ID, connector class ID, name, and type (input/output) are required");
        }
        try {
            const createdConnector = await this.agentConnectorManager.createConnector(parseInt(agentId), connectorClassId, name, type);
            res.status(201).json(createdConnector);
        }
        catch (error) {
            console.error(`Error creating ${type} connector:`, error);
            res.status(500).send("Internal Server Error");
        }
    };
    getActiveAiModels = async (req, res) => {
        try {
            const activeAiModels = await PsAiModel.findAll({
                where: { "configuration.active": true },
            });
            res.json(activeAiModels);
        }
        catch (error) {
            console.error("Error fetching active AI models:", error);
            res.status(500).send("Internal Server Error");
        }
    };
    getActiveAgentClasses = async (req, res) => {
        try {
            const activeAgentClasses = await this.agentRegistryManager.getActiveAgentClasses();
            res.json(activeAgentClasses);
        }
        catch (error) {
            console.error("Error fetching active agent classes:", error);
            if (error instanceof Error) {
                res.status(500).send(`Internal Server Error: ${error.message}`);
            }
            else {
                res.status(500).send("Internal Server Error");
            }
        }
    };
    getActiveConnectorClasses = async (req, res) => {
        try {
            const activeConnectorClasses = await this.agentRegistryManager.getActiveConnectorClasses();
            res.json(activeConnectorClasses);
        }
        catch (error) {
            console.error("Error fetching active connector classes:", error);
            res.status(500).send("Internal Server Error");
        }
    };
    createAgent = async (req, res) => {
        const { name, agentClassId, aiModels, parentAgentId } = req.body;
        try {
            const createdAgent = await this.agentManager.createAgent(name, agentClassId, aiModels, parentAgentId);
            res.status(201).json(createdAgent);
        }
        catch (error) {
            console.error("Error creating agent:", error);
            if (error instanceof Error) {
                res.status(400).send(error.message);
            }
            else {
                res.status(500).send("Internal Server Error");
            }
        }
    };
    controlAgent = async (req, res) => {
        const agentId = parseInt(req.params.id);
        const action = req.body.action;
        try {
            const message = await this.agentQueueManager.controlAgent(agentId, action);
            res.json({ message });
        }
        catch (error) {
            console.error(`Error ${action}ing agent:`, error);
            if (error instanceof Error) {
                res.status(500).json({ error: error.message });
            }
            else {
                res.status(500).json({ error: "An unexpected error occurred" });
            }
        }
    };
    getAgentStatus = async (req, res) => {
        const agentId = parseInt(req.params.id);
        try {
            const status = await this.agentQueueManager.getAgentStatus(agentId);
            if (status) {
                res.json(status);
            }
            else {
                res.status(404).send("Agent status not found");
            }
        }
        catch (error) {
            console.error("Error getting agent status:", error);
            res.status(500).send("Internal Server Error");
        }
    };
    updateAgentStatus = async (req, res) => {
        const agentId = parseInt(req.params.id);
        const { state, details } = req.body;
        try {
            const success = await this.agentQueueManager.updateAgentStatus(agentId, state, details);
            if (success) {
                res.json({ message: "Agent status updated successfully" });
            }
            else {
                res.status(404).send("Agent not found");
            }
        }
        catch (error) {
            console.error("Error updating agent status:", error);
            res.status(500).send("Internal Server Error");
        }
    };
    startAgentProcessing = async (req, res) => {
        const agentId = parseInt(req.params.id);
        try {
            const success = await this.agentQueueManager.startAgentProcessing(agentId);
            if (success) {
                res.json({ message: "Agent processing started successfully" });
            }
            else {
                res.status(404).send("Agent not found");
            }
        }
        catch (error) {
            console.error("Error starting agent processing:", error);
            res.status(500).send("Internal Server Error");
        }
    };
    pauseAgentProcessing = async (req, res) => {
        const agentId = parseInt(req.params.id);
        try {
            const success = await this.agentQueueManager.pauseAgentProcessing(agentId);
            if (success) {
                res.json({ message: "Agent processing paused successfully" });
            }
            else {
                res.status(404).send("Agent not found");
            }
        }
        catch (error) {
            console.error("Error pausing agent processing:", error);
            res.status(500).send("Internal Server Error");
        }
    };
    getAgentCosts = async (req, res) => {
        try {
            const agentId = parseInt(req.params.id);
            const totalCosts = await this.agentCostManager.getAgentCosts(agentId);
            res.json(totalCosts);
        }
        catch (error) {
            console.error("Error calculating agent costs:", error);
            res.status(500).send("Internal Server Error");
        }
    };
}
//# sourceMappingURL=agentsController.js.map