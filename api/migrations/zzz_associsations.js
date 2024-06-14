'use strict';

import { DataTypes } from 'sequelize';
import { sequelize } from './index.js';

export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable('AgentRegistryAgents', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    ps_agent_registry_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'ps_agent_registries',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    ps_agent_class_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'ps_agent_classes',
        key: 'id',
      },
      onDelete: 'CASCADE',
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

  await queryInterface.addIndex('AgentRegistryAgents', ['ps_agent_registry_id']);
  await queryInterface.addIndex('AgentRegistryAgents', ['ps_agent_class_id']);

  await queryInterface.createTable('AgentRegistryConnectors', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    ps_agent_registry_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'ps_agent_registries',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    ps_agent_connector_class_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'ps_agent_connector_classes',
        key: 'id',
      },
      onDelete: 'CASCADE',
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

  await queryInterface.addIndex('AgentRegistryConnectors', ['ps_agent_registry_id']);
  await queryInterface.addIndex('AgentRegistryConnectors', ['ps_agent_connector_class_id']);

  // Creating the AgentConnectors join table
  await queryInterface.createTable('AgentConnectors', {
    agent_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'PsAgents',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    connector_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'PsAgentConnectors',
        key: 'id',
      },
      onDelete: 'CASCADE',
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

  await queryInterface.addIndex('AgentConnectors', ['agent_id']);
  await queryInterface.addIndex('AgentConnectors', ['connector_id']);
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.dropTable('ps_agent_registries');
}