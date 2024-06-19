'use strict';

const { DataTypes } = require('sequelize');

module.exports = {
  up: async (queryInterface, Sequelize) => {
  await queryInterface.createTable('ps_api_costs', {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
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
    ps_external_api_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    callCount: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    agent_id: {
      type: Sequelize.INTEGER,
      allowNull: true,
    },
    connector_id: {
      type: Sequelize.INTEGER,
      allowNull: true,
    },
  });

  await queryInterface.addIndex('ps_api_costs', ['user_id']);
  await queryInterface.addIndex('ps_api_costs', ['ps_external_api_id']);
  await queryInterface.addIndex('ps_api_costs', ['agent_id']);
  await queryInterface.addIndex('ps_api_costs', ['connector_id']);
}
};