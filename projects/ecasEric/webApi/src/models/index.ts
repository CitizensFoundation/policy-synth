import { Sequelize, DataTypes, Model, Optional } from 'sequelize';
import * as dotenv from 'dotenv';

dotenv.config();

const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/config.json')[env];

let sequelize: Sequelize;
if (config.use_env_variable) {
  if (!process.env[config.use_env_variable]) {
    throw new Error(`Environment variable ${config.use_env_variable} is not set.`);
  }
  sequelize = new Sequelize(process.env[config.use_env_variable]!, config);
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
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