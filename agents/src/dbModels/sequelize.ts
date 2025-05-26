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
        logging: process.env.NODE_ENV !== "production" ? logQuery : false,
      }
    );
  } else {
    console.error("NO DATABASE FOUND");
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
