'use strict';

import fs from 'fs';
import path from 'path';
import Sequelize from 'sequelize';
import process from 'process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';

// Read and parse the config file
const configPath = path.join(__dirname, '/../config/config.json');
const configFile = fs.readFileSync(configPath, 'utf-8');
const configData = JSON.parse(configFile);
const config = configData[env];

const db = {};

let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}

// Asynchronously load models
async function loadModels() {
  const files = fs
    .readdirSync(__dirname)
    .filter(file => {
      return (
        file.indexOf('.') !== 0 &&
        file !== basename &&
        file.slice(-3) === '.js' &&
        file.indexOf('.test.js') === -1
      );
    });

  for (const file of files) {
    const filePath = path.join(__dirname, file);
    // ESM requires file URLs for dynamic imports, especially on Windows
    // or when dealing with paths that might have special characters.
    // However, path.join usually gives a suitable path string for Node.
    // Let's try with filePath directly first, if issues arise, convert to fileURL.
    const module = await import(filePath);
    const model = module.default(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  }

  Object.keys(db).forEach(modelName => {
    if (db[modelName].associate) {
      db[modelName].associate(db);
    }
  });

  db.sequelize = sequelize;
  db.Sequelize = Sequelize;
}

// We need to export the db object after it has been populated.
// Since loadModels is async, we need to handle this appropriately.
// One way is to export a promise that resolves to the db object.
// Or, if this module is primarily for side effects (like typical Sequelize setup),
// and other modules will import `db` after it's initialized, this structure might be okay
// if the server start process awaits this module's full execution if needed.
// For now, let's assume direct export after async operations need careful handling
// in the consuming code or by making the main logic await loadModels.

// To ensure db is populated before export, we can make the module itself export a promise
// or use a top-level await if the environment supports it (Node.js 14.8+ for modules).
// Given the original structure, let's aim for direct db export after setup.
// This might mean this module needs to be awaited by whatever imports it if initialization is async.

// To keep the export simple and assuming top-level await isn't an issue or handled by consumer:
await loadModels();

export default db;
