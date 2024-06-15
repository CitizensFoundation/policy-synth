'use strict';

const { DataTypes } = require('sequelize');


module.exports = {
  up: async (queryInterface, Sequelize) => {
  await queryInterface.createTable('ps_model_cost_classes', {
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
    model_id: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    configuration: {
      type: DataTypes.JSONB,
      allowNull: false,
    },
  });

  await queryInterface.addIndex('ps_model_cost_classes', ['uuid']);
  await queryInterface.addIndex('ps_model_cost_classes', ['user_id']);
  await queryInterface.addIndex('ps_model_cost_classes', ['model_id']);
}
};