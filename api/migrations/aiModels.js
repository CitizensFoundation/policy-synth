import { DataTypes } from 'sequelize';
import { sequelize } from '../ts-out/models/index.js';

export const up = async () => {
  await sequelize.getQueryInterface().createTable('ps_ai_model_classes', {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    uuid: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
    },
    user_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    provider: {
      type: DataTypes.STRING,
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
  });

  await sequelize.getQueryInterface().addIndex('ps_ai_model_classes', ['uuid'], {
    unique: true,
  });

  await sequelize.getQueryInterface().addIndex('ps_ai_model_classes', ['user_id']);
};

export const down = async () => {
  await sequelize.getQueryInterface().dropTable('ps_ai_model_classes');
};