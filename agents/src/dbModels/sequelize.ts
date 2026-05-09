import { Sequelize } from "sequelize";
import pg from "pg";
import safe from "colors";
import { dirname } from "path";
import { fileURLToPath } from "url";
import { PolicySynthAgentBase } from "../base/agentBase.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

type DbPoolConfig = {
  max: number;
  min: number;
  acquire: number;
  idle: number;
};

const logQuery = (query: string, options?: number | { bind?: unknown }) => {
  const bind = typeof options === "object" ? options.bind : options;
  PolicySynthAgentBase.logger.debug(safe.bgGreen(new Date().toLocaleString()));
  PolicySynthAgentBase.logger.debug(safe.bgYellow(String(bind)));
  PolicySynthAgentBase.logger.debug(safe.bgBlue(query));
  return options;
};

const buildPoolConfig = (env: NodeJS.ProcessEnv = process.env): DbPoolConfig => ({
  max: parseInt(env.DB_POOL_MAX ?? "5", 10),
  min: parseInt(env.DB_POOL_MIN ?? "5", 10),
  acquire: parseInt(env.DB_POOL_ACQUIRE_MS ?? "30000", 10),
  idle: parseInt(env.DB_POOL_IDLE_MS ?? "10000", 10),
});

const validatePoolConfig = (config: DbPoolConfig) => {
  if (config.min > config.max) {
    PolicySynthAgentBase.logger.error(
      `DB_POOL_MIN (${config.min}) cannot be greater than DB_POOL_MAX (${config.max})`
    );
    process.exit(1);
  }
};

const createSequelizeFromEnv = (
  env: NodeJS.ProcessEnv = process.env,
  config: DbPoolConfig = buildPoolConfig(env)
): Sequelize | undefined => {
  if (env.NODE_ENV === "production") {
    if (env.DISABLE_PG_SSL) {
      return new Sequelize(env.DATABASE_URL!, {
        dialect: "postgres",
        minifyAliases: true,
        pool: config,
        logging: env.PS_LOG_SQL === "true" ? logQuery : false,
        operatorsAliases: {} as any, // You might want to define this properly
      });
    } else {
      return new Sequelize(env.DATABASE_URL!, {
        dialect: "postgres",
        dialectOptions: {
          keepAlive: true,
          keepAliveInitialDelayMillis: 10000,
          ssl: {
            rejectUnauthorized: false,
          },
        },
        minifyAliases: true,
        pool: config,
        retry: {
          max: 3,
          match: [
            /ECONNRESET/i,
            /ETIMEDOUT/i,
            /SequelizeConnectionError/i,
            /SequelizeConnectionTimedOutError/i,
            /57P01/i,
          ],
        },
        logging: env.PS_LOG_SQL === "true" ? logQuery : false,
        operatorsAliases: {} as any, // You might want to define this properly
      });
    }
  } else {
    // For non-production environments
    if (env.PSQL_DB_NAME || env.YP_DEV_DATABASE_NAME) {
      // Use individual environment variables if PSQL_DB_NAME is set
      return new Sequelize(
        env.PSQL_DB_NAME || env.YP_DEV_DATABASE_NAME!,
        env.PSQL_DB_USER || env.YP_DEV_DATABASE_USERNAME!,
        env.PSQL_DB_PASS || env.YP_DEV_DATABASE_PASSWORD!,
        {
          host: env.DB_HOST || "localhost",
          port: parseInt(env.DB_PORT!, 10) || 5432,
          dialect: "postgres",
          define: {
            underscored: true,
          },
          dialectModule: pg,
          // Explicitly disable SSL in development to avoid forcing SSL
          // connections when using local credentials.
          dialectOptions: {
            ssl: false,
          },
          pool: config,
          logging: env.PS_LOG_SQL === "true" ? logQuery : false,
        },
      );
    } else {
      PolicySynthAgentBase.logger.error("NO DATABASE FOUND");
      return undefined;
    }
  }
};

const poolConfig = buildPoolConfig();
validatePoolConfig(poolConfig);
let sequelize = createSequelizeFromEnv(process.env, poolConfig) as Sequelize;

const connectToDatabase = async () => {
  try {
    await sequelize.authenticate();
    PolicySynthAgentBase.logger.debug(
      "Connection to the database has been established successfully."
    );
    PolicySynthAgentBase.logger.info(
      `DB Pool configured: max=${poolConfig.max}, min=${poolConfig.min}, acquire=${poolConfig.acquire}ms, idle=${poolConfig.idle}ms`
    );
  } catch (error) {
    PolicySynthAgentBase.logger.error("Unable to connect to the database:", error);
    process.exit(1);
  }
};

export {
  sequelize,
  connectToDatabase,
  logQuery,
  buildPoolConfig,
  createSequelizeFromEnv,
  validatePoolConfig,
};
