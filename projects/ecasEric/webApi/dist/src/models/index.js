import { Sequelize } from 'sequelize';
import * as dotenv from 'dotenv';
// Add JSON import assertion for ES modules
import configJson from '../../config/config.json' with { type: 'json' };
dotenv.config();
const env = (process.env.NODE_ENV || 'development');
// Access the config based on the environment using the imported JSON
const config = configJson[env];
let sequelize;
if (config.use_env_variable) {
    if (!process.env[config.use_env_variable]) {
        throw new Error(`Environment variable ${config.use_env_variable} is not set.`);
    }
    sequelize = new Sequelize(process.env[config.use_env_variable], {
        dialect: config.dialect,
        host: config.host,
        // Add other Sequelize-specific options from config if needed
    });
}
else {
    sequelize = new Sequelize(config.database, config.username, config.password || undefined, // Handle null password
    {
        host: config.host,
        dialect: config.dialect,
        // Add other Sequelize-specific options from config if needed
    });
}
sequelize.sync().then(() => {
    console.log('Database & tables created!');
}).catch((error) => {
    console.error('Unable to create tables, error:', error);
});
const db = {
    sequelize,
    Sequelize,
};
export { sequelize, db };
//# sourceMappingURL=index.js.map