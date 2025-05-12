import { Sequelize, DataTypes, Model, Optional } from 'sequelize';
import type { Dialect } from 'sequelize';
import * as dotenv from 'dotenv';
// Add JSON import assertion for ES modules
import configJson from '../../config/config.json' with { type: 'json' };

dotenv.config();

const env = (process.env.NODE_ENV || 'development') as keyof typeof configJson;
// Access the config based on the environment using the imported JSON
const config = configJson[env];

let sequelize: Sequelize;
if (config.use_env_variable) {
  if (!process.env[config.use_env_variable]) {
    throw new Error(`Environment variable ${config.use_env_variable} is not set.`);
  }
  sequelize = new Sequelize(process.env[config.use_env_variable]!, {
    dialect: config.dialect as Dialect,
    host: config.host,
    // Add other Sequelize-specific options from config if needed
  });
} else {
  sequelize = new Sequelize(
    config.database,
    config.username,
    config.password || undefined, // Handle null password
    {
      host: config.host,
      dialect: config.dialect as Dialect,
      // Add other Sequelize-specific options from config if needed
    }
  );
}

interface Db {
  sequelize: Sequelize;
  Sequelize: typeof Sequelize;
  Topic?: any;
  QAPair?: any;
  CountryLink?: any;
  AdminUser?: any;
  Review?: any;
  ChatSession?: any;
}

const db: Db = {
  sequelize,
  Sequelize,
};

export { sequelize, db };