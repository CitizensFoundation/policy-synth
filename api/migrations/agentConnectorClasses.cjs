'use strict';

const { DataTypes } = require('sequelize');
module.exports = {
  up: async (queryInterface, Sequelize) => {
  await queryInterface.createTable('ps_agent_connector_classes', {
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
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    version: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    available: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    configuration: {
      type: DataTypes.JSONB,
      allowNull: false,
    },
  });

  await queryInterface.addIndex('ps_agent_connector_classes', ['uuid']);
  await queryInterface.addIndex('ps_agent_connector_classes', ['user_id']);
  await queryInterface.addIndex('ps_agent_connector_classes', ['name']);
  await queryInterface.addIndex('ps_agent_connector_classes', ['version']);
}
};