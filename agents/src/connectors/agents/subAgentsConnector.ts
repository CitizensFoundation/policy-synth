import { PsBaseConnector } from "../base/baseConnector.js";
import { PsConnectorClassTypes } from "../../connectorTypes.js";
import { PsAgent } from "../../dbModels/agent.js";
import { PsAgentConnector } from "../../dbModels/agentConnector.js";

export class PsSubAgentsConnector extends PsBaseConnector {
  static readonly SUB_AGENTS_CONNECTOR_CLASS_BASE_ID =
    "0d0d0d0d-0000-0000-0000-000000000000";

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
      imageUrl: "",
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
          where: { id: (this.connector as any).id },
          attributes: [],
          through: { attributes: [] },
        },
      ],
    });
  }

  async listConnectedOutputAgents(): Promise<PsAgent[]> {
    if (!(this.connector as any).id) return [];
    return await PsAgent.findAll({
      include: [
        {
          model: PsAgentConnector,
          as: "OutputConnectors",
          where: { id: (this.connector as any).id },
          attributes: [],
          through: { attributes: [] },
        },
      ],
    });
  }
}
