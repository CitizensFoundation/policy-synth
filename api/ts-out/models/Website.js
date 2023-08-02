"use strict";
// Website.model.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = __importDefault(require("@/utils/sequelize"));
const openai_1 = require("@/utils/openai");
const pgvector = require('pgvector/utils');
// Types
const sequelize_2 = require("sequelize");
class Website extends sequelize_2.Model {
    id;
    name;
    slug;
    description;
    price;
    image;
    category;
    embedding;
    createdAt;
    updatedAt;
    static async publicSearch(searchTerm, skip = 0, limit = 9999) {
        const embedding = await (0, openai_1.createEmbedding)(searchTerm);
        const embSql = pgvector.toSql(embedding);
        const results = await Website.findAll({
            order: [
                sequelize_1.default.literal(`"embedding" <-> '${embSql}'`),
            ],
            offset: skip,
            limit: limit,
            attributes: {
                exclude: ['embedding']
            }
        });
        return results;
    }
    static initModel() {
        Website.init({
            id: {
                type: sequelize_2.DataTypes.UUID,
                defaultValue: sequelize_2.DataTypes.UUIDV4,
                primaryKey: true,
            },
            name: {
                type: sequelize_2.DataTypes.STRING,
                allowNull: false,
            },
            slug: {
                type: sequelize_2.DataTypes.STRING,
                allowNull: false,
            },
            description: {
                type: sequelize_2.DataTypes.TEXT,
                allowNull: false,
            },
            price: {
                type: sequelize_2.DataTypes.INTEGER,
                allowNull: false,
            },
            image: {
                type: sequelize_2.DataTypes.TEXT,
                allowNull: false,
            },
            category: {
                type: sequelize_2.DataTypes.STRING,
                allowNull: false,
            },
            embedding: {
                // @ts-ignore
                type: sequelize_2.DataTypes.VECTOR(1536),
                allowNull: true,
                defaultValue: null
            }
        }, {
            sequelize: sequelize_1.default,
            tableName: 'websites',
            timestamps: true,
            paranoid: true,
            underscored: true,
        });
    }
}
Website.initModel();
Website.addHook('beforeCreate', async (product) => {
    const input = product.name + '\n' + product.category + '\n' + product.description;
    const embedding = await (0, openai_1.createEmbedding)(input);
    product.embedding = embedding;
    if (product.price) {
        product.price = parseInt(product.price.toString().replace('.', ''));
    }
});
Website.addHook('beforeUpdate', async (product) => {
    const input = product.name + '\n' + product.category + '\n' + product.description;
    const embedding = await (0, openai_1.createEmbedding)(input);
    product.embedding = embedding;
    if (product.changed('price')) {
        product.price = parseInt(product.price.toString().replace('.', ''));
    }
});
exports.default = Website;
