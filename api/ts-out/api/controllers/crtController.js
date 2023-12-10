import express from "express";
import { createClient } from "redis";
import { identifyCauses } from "../openai/crt.js";
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
    constructor() {
        this.initializeRoutes();
    }
    async initializeRoutes() {
        this.router.get(this.path + "/:id", this.getTree);
        this.router.post(this.path, this.createTree);
        this.router.post(this.path + "/:id/createDirectCauses", this.createDirectCauses);
        await redisClient.connect();
    }
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
    createTree = async (req, res) => {
        //TODO: Create new ids automatically
        const treeId = 1; //req.params.id;
        const { context, rawPossibleCauses, undesirableEffects, } = req.body;
        try {
            const treeData = await redisClient.get(`crt:${treeId}`);
            if (treeData) {
                //TODO: Uncomment this
                //return res.status(400).send({ message: "Tree already exists" });
            }
            const newTree = {
                context,
                rawPossibleCauses,
                undesirableEffects,
                nodes: [],
            };
            const directCausesNodes = await identifyCauses(newTree);
            newTree.nodes = directCausesNodes;
            await redisClient.set(`crt:${treeId}`, JSON.stringify(newTree));
            return res.send(newTree.nodes);
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
            const directCausesNodes = await identifyCauses(currentTree, parentNode);
            parentNode.andChildren = directCausesNodes;
            await redisClient.set(`crt:${treeId}`, JSON.stringify(currentTree));
            return res.send(directCausesNodes);
        }
        catch (err) {
            console.error(err);
            return res.sendStatus(500);
        }
    };
    // Helper method to recursively find a node by id
    findNode = (nodes, id) => {
        for (const node of nodes) {
            if (node.id === id) {
                return node;
            }
            if (node.andChildren) {
                const foundInAndChildren = this.findNode(node.andChildren, id);
                if (foundInAndChildren)
                    return foundInAndChildren;
            }
            if (node.orChildren) {
                const foundInOrChildren = this.findNode(node.orChildren, id);
                if (foundInOrChildren)
                    return foundInOrChildren;
            }
        }
        return null;
    };
}
