'use strict';

const { DataTypes } = require('sequelize');

module.exports = {
  up: async (queryInterface, Sequelize) => {
  await queryInterface.createTable('ps_private_access_store', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    group_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    ai_model_id: DataTypes.INTEGER,
    external_api_id: DataTypes.INTEGER,
    encrypted_api_key: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    encrypted_aes_key: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    hashed_user_id: {
      type: DataTypes.STRING,
      allowNull: false
    },
    created_at: DataTypes.DATE,
    updated_at: DataTypes.DATE,
    last_used_at: DataTypes.DATE,
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  });

  await queryInterface.addIndex('ps_private_access_store', ['uuid'], {
    unique: true,
  });
  await queryInterface.addIndex('ps_private_access_store', ['group_id']);
}
};