import { PsAgentClass } from "../dbModels/agentClass.js";
import { initializeModels } from "../dbModels/index.js";
import { sequelize } from "../dbModels/sequelize.js";
import { User } from "../dbModels/ypUser.js";
import { PolicySynthAgentBase } from "../base/agentBase.js";
import { isCliEntrypoint } from "./cliUtils.js";

export type AgentClassAccessRole = "user" | "admin";

type ToolLogger = {
  info(...args: unknown[]): unknown;
  error(...args: unknown[]): unknown;
};

type AgentClassAccessRecord = {
  id: number;
  hasUser(user: unknown): Promise<boolean>;
  hasAdmin(user: unknown): Promise<boolean>;
  addUser(user: unknown): Promise<unknown>;
  addAdmin(user: unknown): Promise<unknown>;
};

export interface AddUserToAgentClassDependencies {
  initializeModels: () => Promise<unknown>;
  findAgentClasses: (agentClassBaseId: string) => Promise<AgentClassAccessRecord[]>;
  findUserById: (userId: number) => Promise<unknown | null>;
  closeDatabase: () => Promise<unknown>;
  logger: ToolLogger;
}

export const defaultAddUserToAgentClassDependencies: AddUserToAgentClassDependencies = {
  initializeModels,
  findAgentClasses: (agentClassBaseId) =>
    PsAgentClass.findAll({
      where: {
        class_base_id: agentClassBaseId,
      },
    }) as Promise<AgentClassAccessRecord[]>,
  findUserById: (userId) => User.findByPk(userId),
  closeDatabase: () => sequelize.close(),
  logger: PolicySynthAgentBase.logger,
};

export async function addUserToAgentClasses(
  agentClassBaseId: string,
  userId: number,
  role: AgentClassAccessRole,
  dependencies: AddUserToAgentClassDependencies =
    defaultAddUserToAgentClassDependencies
) {
  try {
    await dependencies.initializeModels();

    const agentClasses = await dependencies.findAgentClasses(agentClassBaseId);

    if (agentClasses.length === 0) {
      dependencies.logger.error(
        "No agent classes found with the given class_base_id"
      );
      return;
    }

    const user = await dependencies.findUserById(userId);
    if (!user) {
      dependencies.logger.error("User not found");
      return;
    }

    for (const agentClass of agentClasses) {
      const hasAccess =
        role === "user"
          ? await agentClass.hasUser(user)
          : await agentClass.hasAdmin(user);

      if (!hasAccess) {
        if (role === "user") {
          await agentClass.addUser(user);
          dependencies.logger.info(
            `User ${userId} added as user to agent class ${agentClass.id}`
          );
        } else {
          await agentClass.addAdmin(user);
          dependencies.logger.info(
            `User ${userId} added as admin to agent class ${agentClass.id}`
          );
        }
      } else {
        dependencies.logger.info(
          `User ${userId} already has ${role} access to agent class ${agentClass.id}`
        );
      }
    }
  } catch (error) {
    dependencies.logger.error("Error adding user to agent classes:", error);
  } finally {
    await dependencies.closeDatabase();
  }
}

export const addUserToAgentClassesUsage =
  "Usage: ts-node addUserToAgentClasses.ts <agentClassBaseId> <userId> <role>";

export function parseAddUserToAgentClassesArgs(args: string[]) {
  if (args.length !== 3) {
    throw new Error(addUserToAgentClassesUsage);
  }

  const [agentClassBaseId, userId, role] = args;
  if (role !== "user" && role !== "admin") {
    throw new Error('Role must be either "user" or "admin"');
  }

  return {
    agentClassBaseId,
    userId: Number(userId),
    role: role as AgentClassAccessRole,
  };
}

export async function runAddUserToAgentClassesCli(
  args: string[] = process.argv.slice(2),
  dependencies: AddUserToAgentClassDependencies =
    defaultAddUserToAgentClassDependencies
) {
  try {
    const parsed = parseAddUserToAgentClassesArgs(args);
    await addUserToAgentClasses(
      parsed.agentClassBaseId,
      parsed.userId,
      parsed.role,
      dependencies
    );
  } catch (error) {
    dependencies.logger.error(error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

if (isCliEntrypoint(import.meta.url)) {
  await runAddUserToAgentClassesCli();
}
