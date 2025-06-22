import { PsBaseConnector } from "../base/baseConnector.js";
import { PsConnectorClassTypes } from "../../connectorTypes.js";
import { PsAgent } from "../../dbModels/agent.js";
import { PsAgentConnector } from "../../dbModels/agentConnector.js";

export class PsSubAgentsConnector extends PsBaseConnector {
  static readonly SUB_AGENTS_CONNECTOR_CLASS_BASE_ID =
    "eb5a405e-e8bb-4eae-80c9-e5b66aaf164f";

  static readonly SUB_AGENTS_CONNECTOR_VERSION = 1;

  static getConnectorClass: PsAgentConnectorClassCreationAttributes = {
    class_base_id: this.SUB_AGENTS_CONNECTOR_CLASS_BASE_ID,
    name: "Sub Agents Connector",
    version: this.SUB_AGENTS_CONNECTOR_VERSION,
    user_id: 1,
    available: true,
    configuration: {
      name: "Sub Agents Connector",
      classType: PsConnectorClassTypes.SubAgents,
      description: "Connector for linking agents together",
      hasPublicAccess: true,
      imageUrl: "https://aoi-storage-production.citizens.is/dl/f1aba913bcb5fcec9b4bb7edea0989e5--retina-1.png",
      iconName: "agents",
      questions: [
        { uniqueId: "name", text: "Name", type: "textField", maxLength: 200, required: true },
        { uniqueId: "description", text: "Description", type: "textArea", maxLength: 500, required: false },
      ],
    },
  };

  constructor(
    connector: PsAgentConnectorAttributes,
    connectorClass: PsAgentConnectorClassAttributes,
    agent: PsAgent,
    memory: PsAgentMemoryData | undefined = undefined,
    startProgress: number = 0,
    endProgress: number = 100
  ) {
    super(connector, connectorClass, agent, memory, startProgress, endProgress);
  }

  async listConnectedInputAgents(): Promise<PsAgent[]> {
    if (!(this.connector as any).id) return [];
    return await PsAgent.findAll({
      include: [
        {
          model: PsAgentConnector,
          as: "InputConnectors",
          where: { id: this.connector.id },
          attributes: [],
          through: { attributes: [] },
        },
      ],
    });
  }

  async listConnectedOutputAgents(): Promise<PsAgent[]> {
    if (!this.connector.id) return [];
    return await PsAgent.findAll({
      include: [
        {
          model: PsAgentConnector,
          as: "OutputConnectors",
          where: { id: this.connector.id },
          attributes: [],
          through: { attributes: [] },
        },
      ],
    });
  }
}
