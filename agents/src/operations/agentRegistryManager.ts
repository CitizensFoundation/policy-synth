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
        [fn("MAX", col("version")), "max_version"],
      ],
      include: [
        {
          model: PsAgentRegistry,
          as: "Registry",
          attributes: [],
          required: true,
        },
        {
          model: User,
          as: "Users",
          attributes: [],
          required: false,
          through: { attributes: [] },
        },
        {
          model: User,
          as: "Admins",
          attributes: [],
          required: false,
          through: { attributes: [] },
        },
      ],
      where: {
        available: true,
        [Op.or]: [
          {
            "configuration.hasPublicAccess": true
          },
          { "$Users.id$": userId },
          { "$Admins.id$": userId },
        ],
      },
      group: ["class_base_id", "PsAgentClass.id"],
      having: Sequelize.where(col("version"), Op.eq, fn("MAX", col("version"))),
      order: [
        ["class_base_id", "ASC"],
        ["version", "DESC"],
      ],
    });

    return agents;
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
          required: true,
        },
        {
          model: User,
          as: "Users",
          attributes: [],
          required: false,
          through: { attributes: [] },
        },
        {
          model: User,
          as: "Admins",
          attributes: [],
          required: false,
          through: { attributes: [] },
        },
      ],
      where: {
        available: true,
        [Op.or]: [
          {
            "configuration.hasPublicAccess": true
          },
          { "$Users.id$": userId },
          { "$Admins.id$": userId },
        ],
      },
      group: ["class_base_id", "PsAgentConnectorClass.id"],
      having: Sequelize.where(col("version"), Op.eq, fn("MAX", col("version"))),
      order: [
        ["class_base_id", "ASC"],
        ["version", "DESC"],
      ],
    });

    return connectors;
  }
}