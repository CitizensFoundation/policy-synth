import { Sequelize } from 'sequelize';
import * as dotenv from 'dotenv';
dotenv.config();
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/config.json')[env];
let sequelize;
if (config.use_env_variable) {
    if (!process.env[config.use_env_variable]) {
        throw new Error(`Environment variable ${config.use_env_variable} is not set.`);
    }
    sequelize = new Sequelize(process.env[config.use_env_variable], config);
}
else {
    sequelize = new Sequelize(config.database, config.username, config.password, config);
}
const db = {
    sequelize,
    Sequelize,
};
export { sequelize, db };
//# sourceMappingURL=index.js.map