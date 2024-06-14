'use strict';

import { sequelize } from './index.js';

export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable('ps_api_cost_classes', {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    uuid: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      allowNull: false,
    },
    user_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    created_at: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.NOW,
    },
    updated_at: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.NOW,
    },
    model_id: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    configuration: {
      type: Sequelize.JSONB,
      allowNull: false,
    },
  });

  await queryInterface.addIndex('ps_api_cost_classes', ['uuid']);
  await queryInterface.addIndex('ps_api_cost_classes', ['user_id']);
  await queryInterface.addIndex('ps_api_cost_classes', ['model_id']);
}
export async function down(queryInterface, Sequelize) {
  await queryInterface.dropTable('ps_api_cost_classes');
}