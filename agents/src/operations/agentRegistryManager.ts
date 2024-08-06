import {
  PsAgentRegistry,
  PsAgentClass,
  PsAgentConnectorClass,
  User,
} from "../dbModels/index.js";
import { literal, fn, col, Op, Sequelize } from "sequelize";

export class AgentRegistryManager {
  async getActiveAgentClasses(
    userId: number
  ): Promise<PsAgentClassAttributes[]> {
    const agents = await PsAgentClass.findAll({
      attributes: [
        "id",
        "uuid",
        "class_base_id",
        "user_id",
        "created_at",
        "updated_at",
        "name",
        "version",
        "configuration",
        "available",
      ],
      include: [
        {
          model: User,
          as: "Users",
          attributes: [],
          through: { attributes: [] },
          required: false,
        },
        {
          model: User,
          as: "Admins",
          attributes: [],
          through: { attributes: [] },
          required: false,
        },
      ],
      where: {
        available: true,
        [Op.or]: [
          Sequelize.literal(
            `(configuration->>'hasPublicAccess')::boolean = true`
          ),
          { "$Users.id$": userId },
          { "$Admins.id$": userId },
        ],
      },
      order: [
        ["class_base_id", "ASC"],
        ["version", "DESC"],
      ],
    });

    //console.log("Fetched agents:", JSON.stringify(agents, null, 2));

    // Filter to keep only the latest version of each agent
    const latestAgents = agents.reduce((acc, current) => {
      const existingAgent = acc.find(
        (agent) => agent.class_base_id === current.class_base_id
      );
      if (!existingAgent || existingAgent.version < current.version) {
        return [
          ...acc.filter(
            (agent) => agent.class_base_id !== current.class_base_id
          ),
          current,
        ];
      }
      return acc;
    }, [] as PsAgentClass[]);

    //console.log("Latest agents:", JSON.stringify(latestAgents, null, 2));

    return latestAgents;
  }

  async getActiveConnectorClasses(
    userId: number
  ): Promise<PsAgentConnectorClassAttributes[]> {
    const connectors = await PsAgentConnectorClass.findAll({
      attributes: [
        "id",
        "uuid",
        "class_base_id",
        "user_id",
        "created_at",
        "updated_at",
        "name",
        "version",
        "configuration",
        "available",
        [fn("MAX", col("version")), "max_version"],
      ],
      include: [
        {
          model: PsAgentRegistry,
          as: "Registry",
          attributes: [],
          through: { attributes: [] },
        },
        {
          model: User,
          as: "Users",
          attributes: [],
          through: { attributes: [] },
        },
        {
          model: User,
          as: "Admins",
          attributes: [],
          through: { attributes: [] },
        },
      ],
      where: {
        available: true,
        [Op.or]: [
          {
            "configuration.hasPublicAccess": true,
          },
          { "$Users.id$": userId },
          { "$Admins.id$": userId },
        ],
      },
      group: [
        "PsAgentConnectorClass.id",
        "PsAgentConnectorClass.uuid",
        "PsAgentConnectorClass.class_base_id",
        "PsAgentConnectorClass.user_id",
        "PsAgentConnectorClass.created_at",
        "PsAgentConnectorClass.updated_at",
        "PsAgentConnectorClass.name",
        "PsAgentConnectorClass.version",
        "PsAgentConnectorClass.configuration",
        "PsAgentConnectorClass.available",
      ],
      having: Sequelize.where(col("version"), Op.eq, fn("MAX", col("version"))),
      order: [
        ["class_base_id", "ASC"],
        ["version", "DESC"],
      ],
    });

    const latestConnectors = connectors.reduce((acc, current) => {
      const existingConnector = acc.find(
        (connector) => connector.class_base_id === current.class_base_id
      );
      if (!existingConnector || existingConnector.version < current.version) {
        return [
          ...acc.filter(
            (connector) => connector.class_base_id !== current.class_base_id
          ),
          current,
        ];
      }
      return acc;
    }, [] as PsAgentConnectorClass[]);

    console.log("Latest connectors:", latestConnectors.length);

    return latestConnectors;
  }
}
