import {
  PsAgentRegistry,
  PsAgentClass,
  PsAgentConnectorClass,
} from "../dbModels/index.js";

export class AgentRegistryManager {
  async getActiveAgentClasses(): Promise<PsAgentClassAttributes[]> {
    const registry = await PsAgentRegistry.findOne({
      include: [
        {
          model: PsAgentClass,
          as: "Agents",
          where: { available: true },
          through: { attributes: [] },
        },
      ],
    });

    if (!registry) {
      throw new Error("Agent registry not found");
    }

    return registry.Agents!;
  }

  async getActiveConnectorClasses(): Promise<
    PsAgentConnectorClassAttributes[]
  > {
    const registry = await PsAgentRegistry.findOne({
      include: [
        {
          model: PsAgentConnectorClass,
          as: "Connectors",
          where: { available: true },
          through: { attributes: [] },
        },
      ],
    });

    if (!registry) {
      throw new Error("Agent registry not found");
    }

    return registry.Connectors!;
  }
}
