import { Sequelize } from "sequelize";
import pg from "pg";
import safe from "colors";
import { dirname } from "path";
import { fileURLToPath } from "url";
import { PolicySynthAgentBase } from "../base/agentBase.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const logQuery = (query: string, options: any) => {
  PolicySynthAgentBase.logger.debug(safe.bgGreen(new Date().toLocaleString()));
  PolicySynthAgentBase.logger.debug(safe.bgYellow(options.bind));
  PolicySynthAgentBase.logger.debug(safe.bgBlue(query));
  return options;
};

// Pool configuration from environment variables
const poolConfig = {
  max: parseInt(process.env.DB_POOL_MAX ?? "5", 10),
  min: parseInt(process.env.DB_POOL_MIN ?? "5", 10),
  acquire: parseInt(process.env.DB_POOL_ACQUIRE_MS ?? "30000", 10),
  idle: parseInt(process.env.DB_POOL_IDLE_MS ?? "10000", 10),
};

if (poolConfig.min > poolConfig.max) {
  PolicySynthAgentBase.logger.error(
    `DB_POOL_MIN (${poolConfig.min}) cannot be greater than DB_POOL_MAX (${poolConfig.max})`
  );
  process.exit(1);
}

const env = process.env.NODE_ENV || "development";

let sequelize: Sequelize;
//TODO: Don't start many instances
if (process.env.NODE_ENV === "production") {
  if (process.env.DISABLE_PG_SSL) {
    sequelize = new Sequelize(process.env.DATABASE_URL!, {
      dialect: "postgres",
      minifyAliases: true,
      pool: poolConfig,
      logging: process.env.PS_LOG_SQL === "true" ? logQuery : false,
      operatorsAliases: {} as any, // You might want to define this properly
    });
  } else {
    sequelize = new Sequelize(process.env.DATABASE_URL!, {
      dialect: "postgres",
      dialectOptions: {
        ssl: {
          rejectUnauthorized: false,
        },
      },
      minifyAliases: true,
      pool: poolConfig,
      logging: process.env.PS_LOG_SQL === "true" ? logQuery : false,
      operatorsAliases: {} as any, // You might want to define this properly
    });
  }
} else {
  // For non-production environments
  if (process.env.PSQL_DB_NAME || process.env.YP_DEV_DATABASE_NAME) {
    // Use individual environment variables if PSQL_DB_NAME is set
    sequelize = new Sequelize(
      process.env.PSQL_DB_NAME || process.env.YP_DEV_DATABASE_NAME!,
      process.env.PSQL_DB_USER || process.env.YP_DEV_DATABASE_USERNAME!,
      process.env.PSQL_DB_PASS || process.env.YP_DEV_DATABASE_PASSWORD!,
      {
        host: process.env.DB_HOST || "localhost",
        port: parseInt(process.env.DB_PORT!, 10) || 5432,
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
        pool: poolConfig,
        logging: process.env.PS_LOG_SQL === "true" ? logQuery : false,
      }
    );
  } else {
    PolicySynthAgentBase.logger.error("NO DATABASE FOUND");
  }
}

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

export { sequelize, connectToDatabase };
