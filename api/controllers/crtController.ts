import express from "express";
import { createClient } from "redis";
import { identifyCauses } from "../openai/crtCreateNodes.js";
import { getRefinedCauses } from "../openai/crtAssistant.js";
import { v4 as uuidv4 } from "uuid";

let redisClient: any;

if (process.env.REDIS_URL) {
  redisClient = createClient({
    url: process.env.REDIS_URL,
    socket: {
      tls: true,
    },
  });
} else {
  redisClient = createClient({
    url: "redis://localhost:6379",
  });
}

export class CurrentRealityTreeController {
  public path = "/api/crt";
  public router = express.Router();

  constructor() {
    this.initializeRoutes();
  }

  public async initializeRoutes() {
    this.router.get(this.path + "/:id", this.getTree);
    this.router.post(
      this.path,
      this.createTree
    );
    this.router.post(
      this.path + "/:id/createDirectCauses",
      this.createDirectCauses
    );
    this.router.post(
      this.path + "/:id/addDirectCauses",
      this.addDirectCauses
    );

    this.router.post(
      this.path + "/:id/getRefinedCauses",
      this.getRefinedCauses
    );

    await redisClient.connect();
  }

  getRefinedCauses = async (req: express.Request, res: express.Response) => {
    const treeId = req.params.id;
    const { crtNodeId, chatLog }: { crtNodeId: string; chatLog: LtpSimplifiedChatLog[] } = req.body;

    try {

      const treeData = await redisClient.get(`crt:${treeId}`);
      if (!treeData) {
        console.error("Tree not found");
        return res.sendStatus(404);
      }

      const currentTree: LtpCurrentRealityTreeData = JSON.parse(treeData);
      const parentNode = this.findNode(currentTree.nodes, crtNodeId);

      if (!parentNode) {
        console.error("Parent node not found");
        return res.sendStatus(404);
      }

      const response = await getRefinedCauses(currentTree, parentNode, chatLog);

      return res.send(response);
    } catch (err) {
      console.error(err);
      return res.sendStatus(500);
    }
  };

  addDirectCauses = async (req: express.Request, res: express.Response) => {
    const treeId = req.params.id;
    const parentNodeId = req.body.parentNodeId;
    const causeStrings: string[] = req.body.causes;

    try {
      const treeData = await redisClient.get(`crt:${treeId}`);
      if (!treeData) {
        console.error("Tree not found");
        return res.sendStatus(404);
      }

      const currentTree: LtpCurrentRealityTreeData = JSON.parse(treeData);
      const parentNode = this.findNode(currentTree.nodes, parentNodeId);

      if (!parentNode) {
        console.error("Parent node not found");
        return res.sendStatus(404);
      }

      // Convert cause strings to LtpCurrentRealityTreeDataNode objects
      const newNodes = causeStrings.map(cause => ({
        id: uuidv4(),
        cause: cause,
        andChildren: [],
        orChildren: [],
        isRootCause: false,
        isLogicValidated: false
      }));

      // Add the new nodes to the parent node's children
      if (!parentNode.andChildren) {
        parentNode.andChildren = [];
      }
      parentNode.andChildren.push(...newNodes);

      await redisClient.set(`crt:${treeId}`, JSON.stringify(currentTree));

      console.log("Added new nodes to tree")

      return res.send(newNodes);
    } catch (err) {
      console.error(err);
      return res.sendStatus(500);
    }
  };

  getTree = async (req: express.Request, res: express.Response) => {
    const treeId = req.params.id;
    try {
      const treeData = await redisClient.get(`crt:${treeId}`);
      if (!treeData) {
        return res.sendStatus(404);
      }
      return res.send(JSON.parse(treeData));
    } catch (err) {
      console.error(err);
      return res.sendStatus(500);
    }
  };

  addNode = async (req: express.Request, res: express.Response) => {
    const treeId = req.params.id;
    const newNode: LtpCurrentRealityTreeDataNode = req.body;
    const parentId = req.body.parentId; // Get parentId from the request body

    try {
      const treeData = await redisClient.get(`crt:${treeId}`);
      if (!treeData) {
        return res.sendStatus(404);
      }

      const currentTree: LtpCurrentRealityTreeData = JSON.parse(treeData);

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
    } catch (err) {
      console.error(err);
      return res.sendStatus(500);
    }
  };

  createTree = async (req: express.Request, res: express.Response) => {
    //TODO: Create new ids automatically
    const treeId = 1;//req.params.id;
    const {
      context,
      rawPossibleCauses,
      undesirableEffects,
    }: {
      context: string;
      rawPossibleCauses: string;
      undesirableEffects: string[];
    } = req.body;

    try {
      const treeData = await redisClient.get(`crt:${treeId}`);
      if (treeData) {
        //TODO: Uncomment this
        //return res.status(400).send({ message: "Tree already exists" });
      }

      const newTree: LtpCurrentRealityTreeData = {
        context,
        rawPossibleCauses,
        undesirableEffects,
        nodes: [],
      };

      const directCausesNodes = await identifyCauses(newTree);

      newTree.nodes = directCausesNodes;

      await redisClient.set(`crt:${treeId}`, JSON.stringify(newTree));

      return res.send(newTree.nodes);
    } catch (err) {
      console.error(err);
      return res.sendStatus(500);
    }
  };

  createDirectCauses = async (req: express.Request, res: express.Response) => {
    const treeId = req.params.id;
    const parentNodeId = req.body.parentNodeId;

    try {
      const treeData = await redisClient.get(`crt:${treeId}`);
      if (!treeData) {
        console.error("Tree not found")
        return res.sendStatus(404);
      }

      const currentTree: LtpCurrentRealityTreeData = JSON.parse(treeData);

      const parentNode = this.findNode(currentTree.nodes, parentNodeId);

      if (!parentNode) {
        console.error("Parent node not found")
        return res.sendStatus(404);
      }

      const directCausesNodes = await identifyCauses(currentTree, parentNode);

      parentNode.andChildren = directCausesNodes;

      await redisClient.set(`crt:${treeId}`, JSON.stringify(currentTree));

      return res.send(directCausesNodes);
    } catch (err) {
      console.error(err);
      return res.sendStatus(500);
    }
  };

  // Helper method to recursively find a node by id
  findNode = (
    nodes: LtpCurrentRealityTreeDataNode[],
    id: string
  ): LtpCurrentRealityTreeDataNode | null => {
    for (const node of nodes) {
      if (node.id === id) {
        return node;
      }
      if (node.andChildren) {
        const foundInAndChildren = this.findNode(node.andChildren, id);
        if (foundInAndChildren) return foundInAndChildren;
      }
      if (node.orChildren) {
        const foundInOrChildren = this.findNode(node.orChildren, id);
        if (foundInOrChildren) return foundInOrChildren;
      }
    }
    return null;
  };
}


