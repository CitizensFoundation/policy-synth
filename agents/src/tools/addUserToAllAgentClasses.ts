import { PsAgentClass } from "../dbModels/agentClass.js";
import { initializeModels } from "../dbModels/index.js";
import { sequelize } from "../dbModels/sequelize.js";
import { User } from "../dbModels/ypUser.js";
import { PolicySynthAgentBase } from "../base/agentBase.js";
import { isCliEntrypoint } from "./cliUtils.js";

type UserRecord = {
  email: string;
};

type ToolLogger = {
  info(...args: unknown[]): unknown;
  error(...args: unknown[]): unknown;
};

type AgentClassFullAccessRecord = {
  id: number;
  hasUser(user: UserRecord): Promise<boolean>;
  hasAdmin(user: UserRecord): Promise<boolean>;
  addUser(user: UserRecord): Promise<unknown>;
  addAdmin(user: UserRecord): Promise<unknown>;
};

export interface AddUserToAllAgentClassesDependencies {
  initializeModels: () => Promise<unknown>;
  findAllAgentClasses: () => Promise<AgentClassFullAccessRecord[]>;
  findUserByEmail: (email: string) => Promise<UserRecord | null>;
  closeDatabase: () => Promise<unknown>;
  logger: ToolLogger;
}

export const defaultAddUserToAllAgentClassesDependencies: AddUserToAllAgentClassesDependencies = {
  initializeModels,
  findAllAgentClasses: () =>
    PsAgentClass.findAll() as Promise<AgentClassFullAccessRecord[]>,
  findUserByEmail: (email) =>
    User.findOne({
      where: {
        email,
      },
    }) as Promise<UserRecord | null>,
  closeDatabase: () => sequelize.close(),
  logger: PolicySynthAgentBase.logger,
};

export async function addUserToAllAgentClasses(
  userEmail: string,
  dependencies: AddUserToAllAgentClassesDependencies =
    defaultAddUserToAllAgentClassesDependencies
) {
  try {
    await dependencies.initializeModels();

    const agentClasses = await dependencies.findAllAgentClasses();

    if (agentClasses.length === 0) {
      dependencies.logger.error("No agent classes found in the database");
      return;
    }

    const user = await dependencies.findUserByEmail(userEmail);
    if (!user) {
      dependencies.logger.error("User not found");
      return;
    }

    for (const agentClass of agentClasses) {
      const hasUserAccess = await agentClass.hasUser(user);
      if (!hasUserAccess) {
        await agentClass.addUser(user);
        dependencies.logger.info(
          `User ${user.email} added as user to agent class ${agentClass.id}`
        );
      } else {
        dependencies.logger.info(
          `User ${user.email} already has user access to agent class ${agentClass.id}`
        );
      }

      const hasAdminAccess = await agentClass.hasAdmin(user);
      if (!hasAdminAccess) {
        await agentClass.addAdmin(user);
        dependencies.logger.info(
          `User ${user.email} added as admin to agent class ${agentClass.id}`
        );
      } else {
        dependencies.logger.info(
          `User ${user.email} already has admin access to agent class ${agentClass.id}`
        );
      }
    }
  } catch (error) {
    dependencies.logger.error("Error adding user to agent classes:", error);
  } finally {
    await dependencies.closeDatabase();
  }
}

export const addUserToAllAgentClassesUsage =
  "Usage: ts-node addUserToAllAgentClasses.ts <userEmail>";

export function parseAddUserToAllAgentClassesArgs(args: string[]) {
  if (args.length !== 1) {
    throw new Error(addUserToAllAgentClassesUsage);
  }

  return { userEmail: args[0] };
}

export async function runAddUserToAllAgentClassesCli(
  args: string[] = process.argv.slice(2),
  dependencies: AddUserToAllAgentClassesDependencies =
    defaultAddUserToAllAgentClassesDependencies
) {
  try {
    const parsed = parseAddUserToAllAgentClassesArgs(args);
    await addUserToAllAgentClasses(parsed.userEmail, dependencies);
  } catch (error) {
    dependencies.logger.error(error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

if (isCliEntrypoint(import.meta.url)) {
  await runAddUserToAllAgentClassesCli();
}
