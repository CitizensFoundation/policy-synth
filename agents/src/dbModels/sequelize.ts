import { Sequelize } from "sequelize";
import pg from "pg";
import safe from "colors";
import path, { dirname, join } from "path";
import _ from "lodash";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const logQuery = (query: any, options: any) => {
  console.log(safe.bgGreen(new Date().toLocaleString()));
  console.log(safe.bgYellow(options.bind));
  console.log(safe.bgBlue(query));
  return options;
};

const env = process.env.NODE_ENV || "development";

let sequelize: Sequelize;
//TODO: Don't start many instances
if (process.env.NODE_ENV === "production") {
  if (process.env.DISABLE_PG_SSL) {
    sequelize = new Sequelize(process.env.DATABASE_URL!, {
      dialect: "postgres",
      minifyAliases: true,
      logging: false,
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
      logging: false,
      operatorsAliases: {} as any, // You might want to define this properly
    });
  }
} else {
  // For non-production environments
  if (process.env.PSQL_DB_NAME) {
    // Use individual environment variables if PSQL_DB_NAME is set
    sequelize = new Sequelize(
      process.env.PSQL_DB_NAME!,
      process.env.PSQL_DB_USER!,
      process.env.PSQL_DB_PASS!,
      {
        host: process.env.DB_HOST || "localhost",
        port: parseInt(process.env.DB_PORT!, 10) || 5432,
        dialect: "postgres",
        define: {
          underscored: true,
        },
        dialectModule: pg,
        dialectOptions: {
          ssl: {
            require: false,
            rejectUnauthorized: false,
          },
        },
        logging: process.env.NODE_ENV !== "production" ? logQuery : false,
      }
    );
  } else {
    // Fall back to config file if PSQL_DB_NAME is not set
    const configPath = join(
      __dirname,
      "..",
      "..",
      "..",
      "..",
      "ts-out",
      "config",
      "config.json"
    );
    const config = await import(configPath, { assert: { type: "json" } });
    const dbConfig = config.default[env];

    sequelize = new Sequelize(
      dbConfig.database,
      dbConfig.username,
      dbConfig.password,
      _.merge({}, dbConfig, {
        dialect: "postgres", // Ensure dialect is always set
        minifyAliases: true,
        dialectOptions: {
          ssl: false,
          rejectUnauthorized: false,
        },
        logging: process.env.NODE_ENV !== "production" ? logQuery : false,
        operatorsAliases: {} as any, // You might want to define this properly
      })
    );
  }
}

const connectToDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log(
      "Connection to the database has been established successfully."
    );
    //await sequelize.sync(); // Sync all models
    console.log("All models were synchronized successfully.");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
    process.exit(1); // Exit the process with failure
  }
};

export { sequelize, connectToDatabase };
