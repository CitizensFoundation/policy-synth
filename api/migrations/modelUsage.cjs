'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('ps_model_usage', {
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
      model_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      tokenInCount: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      tokenOutCount: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      tokenInCachedContextCount: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
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

    await queryInterface.addIndex('ps_model_usage', ['user_id']);
    await queryInterface.addIndex('ps_model_usage', ['model_id']);
    await queryInterface.addIndex('ps_model_usage', ['agent_id']);
    await queryInterface.addIndex('ps_model_usage', ['connector_id']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('ps_model_usage');
  },
};