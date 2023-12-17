import express from "express";
import { createClient } from "redis";
import { identifyCauses } from "../ltp/crtCreateNodes.js";
import { getRefinedCauses } from "../ltp/crtAssistant.js";
import { v4 as uuidv4 } from "uuid";
import { getConfigurationReview } from "../ltp/crtConfigReview.js";
import WebSocket from "ws";

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
  public wsClients = new Map<string, WebSocket>();

  constructor(wsClients: Map<string, WebSocket>) {
    this.wsClients = wsClients;
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

    this.router.put(
      this.path + "/reviewConfiguration",
      this.reviewTreeConfiguration
    );

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

      const currentTree: LtpCurrentRealityTreeData = JSON.parse(treeData);

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

  deleteNode = async (req: express.Request, res: express.Response) => {
    const treeId = req.params.id;
    const nodeId = req.body.nodeId;

    console.log(`Deleting node ID: ${nodeId}`);

    try {
      const treeData = await this.getData(treeId);
      if (!treeData) {
        return res.sendStatus(404);
      }

      const currentTree: LtpCurrentRealityTreeData = JSON.parse(treeData);

      // Find the parent of the node to be deleted
      const parentNode = this.findParentNode(currentTree.nodes, nodeId);
      if (!parentNode) {
        return res.status(404).send({ message: "Parent node not found" });
      }

      // Remove the node from the parent's children
      parentNode.andChildren = parentNode.andChildren?.filter(
        (child) => child.id !== nodeId
      );
      parentNode.orChildren = parentNode.orChildren?.filter(
        (child) => child.id !== nodeId
      );

      await this.setData(treeId, JSON.stringify(currentTree));

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
    }: {
      crtNodeId: string;
      chatLog: LtpSimplifiedChatLog[];
      wsClientId: string;
    } = req.body;

    try {
      const treeData = await this.getData(treeId);
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
          : this.getParentNodes(currentTree.nodes, parentNode.id)
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

      const currentTree: LtpCurrentRealityTreeData = JSON.parse(treeData);
      const parentNode = this.findNode(currentTree.nodes, parentNodeId);

      if (!parentNode) {
        console.error("Parent node not found");
        return res.sendStatus(404);
      }

      // Convert cause strings to LtpCurrentRealityTreeDataNode objects
      const newNodes = causeStrings.map(
        (cause) =>
          ({
            id: uuidv4(),
            description: cause,
            type:
              nodeType == "assumption"
                ? "assumption"
                : parentNode.type == "ude"
                ? "directCause"
                : "intermediateCause",
            andChildren: [] as LtpCurrentRealityTreeDataNode[],
            orChildren: [] as LtpCurrentRealityTreeDataNode[],
            isRootCause: false,
            isLogicValidated: false,
          } as LtpCurrentRealityTreeDataNode)
      );

      // Add the new nodes to the parent node's children
      if (!parentNode.andChildren) {
        parentNode.andChildren = [];
      }
      parentNode.andChildren.push(...newNodes);

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
      const treeData = await this.getData(treeId);
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
                andChildren: [],
                orChildren: [],
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

      let currentTree: LtpCurrentRealityTreeData = JSON.parse(treeData);

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

      currentTree = JSON.parse(treeData);

      parentNode = this.findNode(currentTree.nodes, parentNodeId)!;

      parentNode.andChildren = directCausesNodes;

      await this.setData(treeId, JSON.stringify(currentTree));

      return res.send(directCausesNodes);
    } catch (err) {
      console.error(err);
      return res.sendStatus(500);
    }
  };

  protected async getData(key: string | number): Promise<string | null> {
    console.log(`Getting data for key: ${key}`);
    return await redisClient.get(`crt:${key}`);
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

  protected async updateData(
    key: string | number,
    updateFunc: (data: any) => any
  ): Promise<void> {
    const data = await this.getData(key);
    if (data) {
      const updatedData = updateFunc(JSON.parse(data));
      await this.setData(key, JSON.stringify(updatedData));
    }
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

  private isParentNode = (
    node: LtpCurrentRealityTreeDataNode,
    childId: string
  ): boolean => {
    // Check in 'andChildren'
    if (
      node.andChildren &&
      node.andChildren.some((child) => child.id === childId)
    ) {
      return true;
    }
    // Check in 'orChildren'
    if (
      node.orChildren &&
      node.orChildren.some((child) => child.id === childId)
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
