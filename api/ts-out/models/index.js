"use strict";
//import { InitUser } from "./user";
Object.defineProperty(exports, "__esModule", { value: true });
exports.models = void 0;
const Sequelize = require("sequelize");
const env = process.env.NODE_ENV || "development";
let sequelize;
if (process.env.DATABASE_URL) {
    sequelize = new Sequelize(process.env.DATABASE_URL, {
        dialect: "postgres",
        dialectOptions: {
            ssl: {
                rejectUnauthorized: false,
            },
        },
    });
}
else {
    const config = require(`${__dirname}/../../config/config.json`)[env];
    sequelize = new Sequelize(config.database, config.username, config.password, config);
}
exports.models = {
    sequelize,
    Sequelize,
    //User: InitUser(sequelize),
};
// Associations
//...
