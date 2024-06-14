'use strict';

import { DataTypes } from 'sequelize';
import { sequelize } from './index.js';

export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable('ps_agent_audit_logs', {
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
    agent_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    connector_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    action: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    details: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    timestamp: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  });

  await queryInterface.addIndex('ps_agent_audit_logs', ['uuid']);
  await queryInterface.addIndex('ps_agent_audit_logs', ['user_id']);
  await queryInterface.addIndex('ps_agent_audit_logs', ['agent_id']);
  await queryInterface.addIndex('ps_agent_audit_logs', ['connector_id']);
}
export async function down(queryInterface, Sequelize) {
  await queryInterface.dropTable('ps_agent_audit_logs');
}