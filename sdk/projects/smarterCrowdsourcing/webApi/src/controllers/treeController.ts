import express from "express";
import { createClient } from "redis";
import { identifyCauses } from "../ltp/crtCreateNodes.js";
import { getRefinedCauses } from "../ltp/crtAssistant.js";
import { v4 as uuidv4 } from "uuid";
import { getConfigurationReview } from "../ltp/crtConfigReview.js";
import WebSocket from "ws";
import { runValidationChain } from "../ltp/crtValidationChain.js";
import { BaseController } from "./baseController.js";

let redisClient: any;

if (process.env.REDIS_AGENT_URL) {
  redisClient = createClient({
    url: process.env.REDIS_AGENT_URL,
    socket: {
      tls: true,
    },
  });
} else {
  redisClient = createClient({
    url: "redis://localhost:6379",
  });
}

export class TreeController  extends BaseController {
  public path = "/api/crt";

  constructor(wsClients: Map<string, WebSocket>) {
    super(wsClients);
    this.initializeRoutes();
  }

  public async initializeRoutes() {
    this.router.get(this.path + "/:id", this.getTree);
    this.router.post(this.path, this.createTree);
    this.router.post(
      this.path + "/:id/createDirectCauses",
      this.createDirectCauses
    );
    this.router.post(this.path + "/:id/addDirectCauses", this.addDirectCauses);

    this.router.post(
      this.path + "/:id/getRefinedCauses",
      this.getRefinedCauses
    );

    this.router.post(
      this.path + "/:id/runValidationChain",
      this.runValidationChain
    );

    this.router.put(
      this.path + "/reviewConfiguration",
      this.reviewTreeConfiguration
    );

    this.router.put(this.path + "/:id/updateChildren", this.updateNodeChildren);

    this.router.delete(this.path + "/:id", this.deleteNode);
    this.router.put(this.path + "/:id", this.updateNode);

    await redisClient.connect();
  }

  updateNode = async (req: express.Request, res: express.Response) => {
    const treeId = req.params.id;
    const updatedNode: LtpCurrentRealityTreeDataNode = req.body;

    console.log(`Updating node ID: ${updatedNode.id}`);

    try {
      const treeData = await this.getData(treeId);
      if (!treeData) {
        return res.sendStatus(404);
      }

      const currentTree: LtpCurrentRealityTreeData = treeData;

      // Update the node in the tree
      const nodeToUpdate = this.findNode(currentTree.nodes, updatedNode.id);
      if (!nodeToUpdate) {
        return res.status(404).send({ message: "Node not found" });
      }

      Object.assign(nodeToUpdate, updatedNode);

      await this.setData(treeId, JSON.stringify(currentTree));

      return res.sendStatus(200);
    } catch (err) {
      console.error(err);
      return res.sendStatus(500);
    }
  };

  updateNodeChildren = async (req: express.Request, res: express.Response) => {
    const treeId = req.params.id;
    const nodeId = req.body.nodeId;
    const childrenIds: string[] = req.body.childrenIds;

    try {
      const treeData = await this.getData(treeId);
      if (!treeData) {
        return res.status(404).send({ message: "Tree not found" });
      }

      const currentTree: LtpCurrentRealityTreeData = treeData;

      // Find the node to update
      const nodeToUpdate = this.findNode(currentTree.nodes, nodeId);
      if (!nodeToUpdate) {
        return res.status(404).send({ message: "Node not found" });
      }

      // Find and update the children of the node
      const updatedChildren = childrenIds.map(childId => this.findNode(currentTree.nodes, childId)).filter(node => node !== null);

      nodeToUpdate.children = updatedChildren;
      await this.setData(treeId, JSON.stringify(currentTree));

      return res.status(200).send(nodeToUpdate);
    } catch (err) {
      console.error(err);
      return res.status(500).send({ message: "Internal Server Error" });
    }
  };

  deleteNode = async (req: express.Request, res: express.Response) => {
    const treeId = req.params.id;
    const nodeId = req.body.nodeId;

    console.log(`Deleting node ID: ${nodeId}`);

    try {
      const treeData = await this.getData(treeId);
      if (!treeData) {
        return res.sendStatus(404);
      }

      const currentTree: LtpCurrentRealityTreeData = treeData;

      // Find the parent of the node to be deleted
      const parentNode = this.findParentNode(currentTree.nodes, nodeId);
      if (!parentNode) {
        return res.status(404).send({ message: "Parent node not found" });
      }

      // Remove the node from the parent's children
      parentNode.children = parentNode.children?.filter(
        (child) => child.id !== nodeId
      );

      await this.setData(treeId, JSON.stringify(currentTree));

      return res.sendStatus(200);
    } catch (err) {
      console.error(err);
      return res.sendStatus(500);
    }
  };

  runValidationChain = async (req: express.Request, res: express.Response) => {
    console.log("runValidationChain");
    const treeId = req.params.id;
    const {
      crtNodeId,
      chatLog,
      wsClientId,
      effect,
      causes,
      validationResults,
    }: {
      crtNodeId: string;
      chatLog: PsSimpleChatLog[];
      wsClientId: string;
      effect: string;
      causes: string[];
      validationResults: string;
    } = req.body;

    try {
      const treeData = await this.getData(treeId);
      if (!treeData) {
        console.error("Tree not found");
        return res.sendStatus(404);
      }

      const currentTree: LtpCurrentRealityTreeData = treeData;
      const parentNode = this.findNode(currentTree.nodes, crtNodeId);

      if (!parentNode) {
        console.error("Parent node not found");
        return res.sendStatus(404);
      }

      const nearestUdeNode = this.findNearestUde(
        currentTree.nodes,
        parentNode.id
      );

      if (!nearestUdeNode) {
        console.error("Nearest UDE node not found for: " + crtNodeId);
        console.log(JSON.stringify(currentTree, null, 2));
        return res.sendStatus(404);
      }

      await runValidationChain(
        currentTree,
        wsClientId,
        this.wsClients,
        parentNode,
        nearestUdeNode.description,
        chatLog,
        parentNode.type == "ude"
          ? undefined
          : this.getParentNodes(currentTree.nodes, parentNode.id),
        effect,
        causes,
        validationResults,
        this.basePromptOverrides
      );

      return res.sendStatus(200);
    } catch (err) {
      console.error(err);
      return res.sendStatus(500);
    }
  };

  getRefinedCauses = async (req: express.Request, res: express.Response) => {
    console.log("getRefinedCauses");
    const treeId = req.params.id;
    const {
      crtNodeId,
      chatLog,
      wsClientId,
      effect,
      causes,
      validationResults,
    }: {
      crtNodeId: string;
      chatLog: PsSimpleChatLog[];
      wsClientId: string;
      effect?: string;
      causes?: string[];
      validationResults?: string;
    } = req.body;

    try {
      const treeData = await this.getData(treeId);
      if (!treeData) {
        console.error("Tree not found");
        return res.sendStatus(404);
      }

      const currentTree: LtpCurrentRealityTreeData = treeData;
      const parentNode = this.findNode(currentTree.nodes, crtNodeId);

      if (!parentNode) {
        console.error("Parent node not found");
        return res.sendStatus(404);
      }

      const nearestUdeNode = this.findNearestUde(
        currentTree.nodes,
        parentNode.id
      );

      if (!nearestUdeNode) {
        console.error("Nearest UDE node not found for: " + crtNodeId);
        console.log(JSON.stringify(currentTree, null, 2));
        return res.sendStatus(404);
      }

      await getRefinedCauses(
        currentTree,
        wsClientId,
        this.wsClients,
        parentNode,
        nearestUdeNode.description,
        chatLog,
        parentNode.type == "ude"
          ? undefined
          : this.getParentNodes(currentTree.nodes, parentNode.id),
        this.basePromptOverrides,
        effect,
        causes,
        validationResults
      );

      return res.sendStatus(200);
    } catch (err) {
      console.error(err);
      return res.sendStatus(500);
    }
  };

  addDirectCauses = async (req: express.Request, res: express.Response) => {
    const treeId = req.params.id;
    const parentNodeId = req.body.parentNodeId;
    const nodeType = req.body.type;
    const causeStrings: string[] = req.body.causes;

    try {
        const treeData = await this.getData(treeId);
        if (!treeData) {
            console.error("Tree not found");
            return res.sendStatus(404);
        }

        const currentTree: LtpCurrentRealityTreeData = treeData;
        const parentNode = this.findNode(currentTree.nodes, parentNodeId);

        if (!parentNode) {
            console.error("Parent node not found");
            return res.sendStatus(404);
        }

        let newNodes = causeStrings.map(cause => ({
            id: uuidv4(),
            description: cause,
            type: nodeType === "assumption" ? "assumption" : "directCause",
            children: [] as LtpCurrentRealityTreeDataNode[],
            isRootCause: false,
            isLogicValidated: false,
        }));

        console.log("New nodes count: ", newNodes.length)

        // If more than two cause strings, add an AND node
        if (causeStrings.length > 1) {
            const andNode = {
                id: uuidv4(),
                description: "AND node",
                type: "and",
                children: newNodes  as LtpCurrentRealityTreeDataNode[],
                isRootCause: false,
                isLogicValidated: false,
            };

            newNodes = [andNode];
        }

        // Add the new nodes to the parent node's children
        if (!parentNode.children) {
            parentNode.children = [];
        }
        parentNode.children.push(...newNodes);

        await this.setData(treeId, JSON.stringify(currentTree));

        console.log("Added new nodes to tree");

        return res.send(newNodes);
    } catch (err) {
        console.error(err);
        return res.sendStatus(500);
    }
};


  getTree = async (req: express.Request, res: express.Response) => {
    const treeId = req.params.id;
    try {
      const treeData = await this.getData(treeId);
      if (!treeData) {
        return res.sendStatus(404);
      }
      return res.send(treeData);
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
      const treeData = await this.getData(treeId);
      if (!treeData) {
        return res.sendStatus(404);
      }

      const currentTree: LtpCurrentRealityTreeData = treeData;

      // Find the parent node in the tree
      const parentNode = this.findNode(currentTree.nodes, parentId);

      if (!parentNode) {
        return res.status(400).send({ message: "Parent node not found" });
      }

      // Assuming a binary tree structure for simplicity. Modify as needed for your tree structure.
      if (!parentNode.children) {
        parentNode.children = [];
      }
      parentNode.children.push(newNode);

      await this.setData(treeId, JSON.stringify(currentTree));
      return res.sendStatus(200);
    } catch (err) {
      console.error(err);
      return res.sendStatus(500);
    }
  };

  reviewTreeConfiguration = async (
    req: express.Request,
    res: express.Response
  ) => {
    const {
      context,
      undesirableEffects,
      wsClientId,
    }: {
      context: string;
      undesirableEffects: string[];
      wsClientId: string;
    } = req.body;

    try {
      const treeToTest: LtpCurrentRealityTreeData = {
        context,
        undesirableEffects,
        nodes: [],
        id: "n/a",
      };

      await getConfigurationReview(treeToTest, wsClientId, this.wsClients);

      return res.sendStatus(200);
    } catch (err) {
      console.error(err);
      return res.sendStatus(500);
    }
  };

  createTree = async (req: express.Request, res: express.Response) => {
    const {
      context,
      undesirableEffects,
    }: {
      context: string;
      undesirableEffects: string[];
    } = req.body;

    try {
      const directNodes = undesirableEffects.flatMap((ue) =>
        ue
          .split("\n")
          .map((effect) => effect.trim()) // Trim each effect
          .filter((effect) => effect !== "") // Filter out empty strings
          .map(
            (effect) =>
              ({
                id: uuidv4(),
                description: effect,
                type: "ude",
                children: []
              } as LtpCurrentRealityTreeDataNode)
          )
      );

      const newTree: LtpCurrentRealityTreeData = {
        id: -1,
        context,
        undesirableEffects,
        nodes: directNodes,
      };

      let treeId = await this.createData(JSON.stringify(newTree));
      newTree.id = treeId;
      await this.setData(treeId, JSON.stringify(newTree));

      return res.send(newTree);
    } catch (err) {
      console.error(err);
      return res.sendStatus(500);
    }
  };

  createDirectCauses = async (req: express.Request, res: express.Response) => {
    const treeId = req.params.id;
    const parentNodeId = req.body.parentNodeId;

    try {
      let treeData = await this.getData(treeId);
      if (!treeData) {
        console.error("Tree not found");
        return res.sendStatus(404);
      }

      let currentTree: LtpCurrentRealityTreeData = treeData;

      let parentNode = this.findNode(currentTree.nodes, parentNodeId);

      if (!parentNode) {
        console.error("Parent node not found");
        return res.sendStatus(404);
      }

      const nearestUdeNode = this.findNearestUde(
        currentTree.nodes,
        parentNodeId
      );

      if (!nearestUdeNode) {
        console.error("Nearest UDE node not found");
        return res.sendStatus(404);
      }

      // Passing the description of the nearest UDE node to identifyCauses
      const directCausesNodes = await identifyCauses(
        currentTree,
        nearestUdeNode.description,
        parentNode
      );

      treeData = await this.getData(treeId);

      if (!treeData) {
        console.error("Tree not found");
        return res.sendStatus(404);
      }

      currentTree = treeData;

      parentNode = this.findNode(currentTree.nodes, parentNodeId)!;

      parentNode.children = directCausesNodes;

      await this.setData(treeId, JSON.stringify(currentTree));

      return res.send(directCausesNodes);
    } catch (err) {
      console.error(err);
      return res.sendStatus(500);
    }
  };

  protected async getData(
    key: string | number
  ): Promise<LtpCurrentRealityTreeData | null> {
    console.log(`Getting data for key: ${key}`);
    const data = await redisClient.get(`crt:${key}`);
    if (data) {
      return JSON.parse(data);
    } else {
      return null;
    }
  }

  protected async setData(key: string | number, value: string): Promise<void> {
    console.log(`Setting data for key: ${key}`);
    await redisClient.set(`crt:${key}`, value);
  }

  protected async createData(value: string | any): Promise<number | string> {
    const treeId = uuidv4();
    this.setData(treeId, value);
    return treeId;
  }

  protected async deleteData(key: string | number): Promise<void> {
    await redisClient.del(`crt-${key}`);
  }

  private getParentNodes = (
    nodes: LtpCurrentRealityTreeDataNode[],
    childId: string
  ): LtpCurrentRealityTreeDataNode[] => {
    let parentNode = this.findParentNode(nodes, childId);
    const parentNodes = [];
    while (parentNode) {
      parentNodes.push(parentNode);
      parentNode = this.findParentNode(nodes, parentNode.id);
    }
    return parentNodes;
  };

  private findNearestUde = (
    nodes: LtpCurrentRealityTreeDataNode[],
    nodeId: string
  ): LtpCurrentRealityTreeDataNode | null => {
    console.log(`Finding nearest UDE for node ID: ${nodeId}`);
    let currentNode = this.findNode(nodes, nodeId);

    while (currentNode) {
      console.log(
        `Current node ID: ${currentNode.id}, type: ${currentNode.type}`
      );
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

  private findParentNode = (
    nodes: LtpCurrentRealityTreeDataNode[],
    childId: string
  ): LtpCurrentRealityTreeDataNode | null => {
    console.log(`Finding parent for child ID: ${childId}`);
    for (const node of nodes) {
      console.log(`Checking if node ID: ${node.id} is parent of ${childId}`);
      if (this.isParentNode(node, childId)) {
        console.log(`Found parent ID: ${node.id} for child ID: ${childId}`);
        return node;
      }

      // Check if any children have the node as a child
      const foundParentInChildren = node.children
        ? this.findParentNode(node.children, childId)
        : null;
      if (foundParentInChildren) {
        return foundParentInChildren;
      }
    }
    console.log(`No parent found for child ID: ${childId}`);
    return null;
  };

  private isParentNode = (
    node: LtpCurrentRealityTreeDataNode,
    childId: string
  ): boolean => {
    // Check in 'children'
    if (
      node.children &&
      node.children.some((child) => child.id === childId)
    ) {
      return true;
    }

    // Not found in this node's direct children
    return false;
  };

  private findNode = (
    nodes: LtpCurrentRealityTreeDataNode[],
    id: string
  ): LtpCurrentRealityTreeDataNode | null => {
    for (const node of nodes) {
      console.log(`Checking node ID: ${node.id}`);
      if (node.id === id) {
        console.log(`Node found with ID: ${id}`);
        return node;
      }
      if (node.children) {
        const foundInChildren = this.findNode(node.children, id);
        if (foundInChildren) {
          console.log(`Node found in 'children' with ID: ${id}`);
          return foundInChildren;
        }
      }
    }
    console.log(`No node found with ID: ${id}`);
    return null;
  };
}
