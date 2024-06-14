'use strict';

const { sequelize } = require('./index.js');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('ps_model_costs', {
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
      cost_class_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      cost: {
        type: Sequelize.FLOAT,
        allowNull: false,
      },
      agent_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      connector_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
    });

    await queryInterface.addIndex('ps_model_costs', ['uuid']);
    await queryInterface.addIndex('ps_model_costs', ['user_id']);
    await queryInterface.addIndex('ps_model_costs', ['cost_class_id']);
    await queryInterface.addIndex('ps_model_costs', ['agent_id']);
    await queryInterface.addIndex('ps_model_costs', ['connector_id']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('ps_model_costs');
  },
};