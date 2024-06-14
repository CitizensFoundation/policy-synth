'use strict';

import { sequelize } from './index.js';
import { DataTypes } from 'sequelize';

export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable('ps_agent_connectors', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    uuid: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    class_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    group_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    configuration: {
      type: DataTypes.JSONB,
      allowNull: false,
    },
  });

  await queryInterface.addIndex('ps_agent_connectors', ['uuid']);
  await queryInterface.addIndex('ps_agent_connectors', ['user_id']);
  await queryInterface.addIndex('ps_agent_connectors', ['class_id']);
  await queryInterface.addIndex('ps_agent_connectors', ['group_id']);
}
export async function down(queryInterface, Sequelize) {
  await queryInterface.dropTable('ps_agent_connectors');
}