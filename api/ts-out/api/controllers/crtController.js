import express from "express";
import { createClient } from "redis";
import { identifyCauses } from "../ltp/crtCreateNodes.js";
import { getRefinedCauses } from "../ltp/crtAssistant.js";
import { v4 as uuidv4 } from "uuid";
import { getConfigurationReview } from "../ltp/crtConfigReview.js";
let redisClient;
if (process.env.REDIS_URL) {
    redisClient = createClient({
        url: process.env.REDIS_URL,
        socket: {
            tls: true,
        },
    });
}
else {
    redisClient = createClient({
        url: "redis://localhost:6379",
    });
}
export class CurrentRealityTreeController {
    path = "/api/crt";
    router = express.Router();
    wsClients = new Map();
    constructor(wsClients) {
        this.wsClients = wsClients;
        this.initializeRoutes();
    }
    async initializeRoutes() {
        this.router.get(this.path + "/:id", this.getTree);
        this.router.post(this.path, this.createTree);
        this.router.post(this.path + "/:id/createDirectCauses", this.createDirectCauses);
        this.router.post(this.path + "/:id/addDirectCauses", this.addDirectCauses);
        this.router.post(this.path + "/:id/getRefinedCauses", this.getRefinedCauses);
        this.router.put(this.path + "/reviewConfiguration", this.reviewTreeConfiguration);
        await redisClient.connect();
    }
    getRefinedCauses = async (req, res) => {
        const treeId = req.params.id;
        const { crtNodeId, chatLog, } = req.body;
        try {
            const treeData = await redisClient.get(`crt:${treeId}`);
            if (!treeData) {
                console.error("Tree not found");
                return res.sendStatus(404);
            }
            const currentTree = JSON.parse(treeData);
            const parentNode = this.findNode(currentTree.nodes, crtNodeId);
            if (!parentNode) {
                console.error("Parent node not found");
                return res.sendStatus(404);
            }
            const nearestUdeNode = this.findNearestUde(currentTree.nodes, parentNode.id);
            if (!nearestUdeNode) {
                console.error("Nearest UDE node not found for: " + crtNodeId);
                console.log(JSON.stringify(currentTree, null, 2));
                return res.sendStatus(404);
            }
            const response = await getRefinedCauses(currentTree, parentNode, nearestUdeNode.description, chatLog);
            return res.send(response);
        }
        catch (err) {
            console.error(err);
            return res.sendStatus(500);
        }
    };
    addDirectCauses = async (req, res) => {
        const treeId = req.params.id;
        const parentNodeId = req.body.parentNodeId;
        const causeStrings = req.body.causes;
        try {
            const treeData = await redisClient.get(`crt:${treeId}`);
            if (!treeData) {
                console.error("Tree not found");
                return res.sendStatus(404);
            }
            const currentTree = JSON.parse(treeData);
            const parentNode = this.findNode(currentTree.nodes, parentNodeId);
            if (!parentNode) {
                console.error("Parent node not found");
                return res.sendStatus(404);
            }
            // Convert cause strings to LtpCurrentRealityTreeDataNode objects
            const newNodes = causeStrings.map((cause) => ({
                id: uuidv4(),
                description: cause,
                type: parentNode.type == "ude" ? "directCause" : "intermediateCause",
                andChildren: [],
                orChildren: [],
                isRootCause: false,
                isLogicValidated: false,
            }));
            // Add the new nodes to the parent node's children
            if (!parentNode.andChildren) {
                parentNode.andChildren = [];
            }
            parentNode.andChildren.push(...newNodes);
            await redisClient.set(`crt:${treeId}`, JSON.stringify(currentTree));
            console.log("Added new nodes to tree");
            return res.send(newNodes);
        }
        catch (err) {
            console.error(err);
            return res.sendStatus(500);
        }
    };
    getTree = async (req, res) => {
        const treeId = req.params.id;
        try {
            const treeData = await redisClient.get(`crt:${treeId}`);
            if (!treeData) {
                return res.sendStatus(404);
            }
            return res.send(JSON.parse(treeData));
        }
        catch (err) {
            console.error(err);
            return res.sendStatus(500);
        }
    };
    addNode = async (req, res) => {
        const treeId = req.params.id;
        const newNode = req.body;
        const parentId = req.body.parentId; // Get parentId from the request body
        try {
            const treeData = await redisClient.get(`crt:${treeId}`);
            if (!treeData) {
                return res.sendStatus(404);
            }
            const currentTree = JSON.parse(treeData);
            // Find the parent node in the tree
            const parentNode = this.findNode(currentTree.nodes, parentId);
            if (!parentNode) {
                return res.status(400).send({ message: "Parent node not found" });
            }
            // Assuming a binary tree structure for simplicity. Modify as needed for your tree structure.
            if (!parentNode.andChildren) {
                parentNode.andChildren = [];
            }
            parentNode.andChildren.push(newNode);
            await redisClient.set(`crt:${treeId}`, JSON.stringify(currentTree));
            return res.sendStatus(200);
        }
        catch (err) {
            console.error(err);
            return res.sendStatus(500);
        }
    };
    reviewTreeConfiguration = async (req, res) => {
        const { context, undesirableEffects, wsClientId, } = req.body;
        try {
            const treeToTest = {
                context,
                undesirableEffects,
                nodes: [],
                id: "n/a",
            };
            await getConfigurationReview(treeToTest, wsClientId, this.wsClients);
            return res.sendStatus(200);
        }
        catch (err) {
            console.error(err);
            return res.sendStatus(500);
        }
    };
    createTree = async (req, res) => {
        const treeId = uuidv4();
        const { context, undesirableEffects, } = req.body;
        try {
            const treeData = await redisClient.get(`crt:${treeId}`);
            if (treeData) {
                return res.status(400).send({ message: "Tree already exists" });
            }
            const directNodes = undesirableEffects.flatMap((ue) => ue
                .split("\n")
                .map((effect) => effect.trim()) // Trim each effect
                .filter((effect) => effect !== "") // Filter out empty strings
                .map((effect) => ({
                id: uuidv4(),
                description: effect,
                type: "ude",
                andChildren: [],
                orChildren: [],
            })));
            const newTree = {
                id: treeId,
                context,
                undesirableEffects,
                nodes: directNodes,
            };
            await redisClient.set(`crt:${treeId}`, JSON.stringify(newTree));
            return res.send(newTree);
        }
        catch (err) {
            console.error(err);
            return res.sendStatus(500);
        }
    };
    createDirectCauses = async (req, res) => {
        const treeId = req.params.id;
        const parentNodeId = req.body.parentNodeId;
        try {
            let treeData = await redisClient.get(`crt:${treeId}`);
            if (!treeData) {
                console.error("Tree not found");
                return res.sendStatus(404);
            }
            const currentTree = JSON.parse(treeData);
            const parentNode = this.findNode(currentTree.nodes, parentNodeId);
            if (!parentNode) {
                console.error("Parent node not found");
                return res.sendStatus(404);
            }
            const nearestUdeNode = this.findNearestUde(currentTree.nodes, parentNodeId);
            if (!nearestUdeNode) {
                console.error("Nearest UDE node not found");
                return res.sendStatus(404);
            }
            // Passing the description of the nearest UDE node to identifyCauses
            const directCausesNodes = await identifyCauses(currentTree, nearestUdeNode.description, parentNode);
            parentNode.andChildren = directCausesNodes;
            await redisClient.set(`crt:${treeId}`, JSON.stringify(currentTree));
            return res.send(directCausesNodes);
        }
        catch (err) {
            console.error(err);
            return res.sendStatus(500);
        }
    };
    findNearestUde = (nodes, nodeId) => {
        console.log(`Finding nearest UDE for node ID: ${nodeId}`);
        let currentNode = this.findNode(nodes, nodeId);
        while (currentNode) {
            console.log(`Current node ID: ${currentNode.id}, type: ${currentNode.type}`);
            if (currentNode.type === "ude") {
                console.log(`Found UDE node: ${currentNode.id}`);
                return currentNode;
            }
            currentNode = this.findParentNode(nodes, currentNode.id);
        }
        console.log(`No UDE node found for node ID: ${nodeId}`);
        console.log(JSON.stringify(nodes, null, 2));
        return null;
    };
    findParentNode = (nodes, childId) => {
        console.log(`Finding parent for child ID: ${childId}`);
        for (const node of nodes) {
            console.log(`Checking if node ID: ${node.id} is parent of ${childId}`);
            if (this.isParentNode(node, childId)) {
                console.log(`Found parent ID: ${node.id} for child ID: ${childId}`);
                return node;
            }
            // Check if any children have the node as a child
            const foundParentInAndChildren = node.andChildren
                ? this.findParentNode(node.andChildren, childId)
                : null;
            if (foundParentInAndChildren) {
                return foundParentInAndChildren;
            }
            const foundParentInOrChildren = node.orChildren
                ? this.findParentNode(node.orChildren, childId)
                : null;
            if (foundParentInOrChildren) {
                return foundParentInOrChildren;
            }
        }
        console.log(`No parent found for child ID: ${childId}`);
        return null;
    };
    isParentNode = (node, childId) => {
        // Check in 'andChildren'
        if (node.andChildren &&
            node.andChildren.some((child) => child.id === childId)) {
            return true;
        }
        // Check in 'orChildren'
        if (node.orChildren &&
            node.orChildren.some((child) => child.id === childId)) {
            return true;
        }
        // Not found in this node's direct children
        return false;
    };
    findNode = (nodes, id) => {
        for (const node of nodes) {
            console.log(`Checking node ID: ${node.id}`);
            if (node.id === id) {
                console.log(`Node found with ID: ${id}`);
                return node;
            }
            if (node.andChildren) {
                const foundInAndChildren = this.findNode(node.andChildren, id);
                if (foundInAndChildren) {
                    console.log(`Node found in 'andChildren' with ID: ${id}`);
                    return foundInAndChildren;
                }
            }
            if (node.orChildren) {
                const foundInOrChildren = this.findNode(node.orChildren, id);
                if (foundInOrChildren) {
                    console.log(`Node found in 'orChildren' with ID: ${id}`);
                    return foundInOrChildren;
                }
            }
        }
        console.log(`No node found with ID: ${id}`);
        return null;
    };
}
