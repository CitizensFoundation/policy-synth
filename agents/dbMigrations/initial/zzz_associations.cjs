"use strict";

const { DataTypes } = require("sequelize");

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("AgentRegistryAgents", {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      ps_agent_registry_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "ps_agent_registries",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      ps_agent_class_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "ps_agent_classes",
          key: "id",
        },
        onDelete: "CASCADE",
      },
    });

    await queryInterface.addIndex("AgentRegistryAgents", [
      "ps_agent_registry_id",
    ]);
    await queryInterface.addIndex("AgentRegistryAgents", ["ps_agent_class_id"]);

    await queryInterface.createTable("AgentRegistryConnectors", {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      ps_agent_registry_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "ps_agent_registries",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      ps_agent_connector_class_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "ps_agent_connector_classes",
          key: "id",
        },
        onDelete: "CASCADE",
      },
    });

    await queryInterface.addIndex("AgentRegistryConnectors", [
      "ps_agent_registry_id",
    ]);
    await queryInterface.addIndex("AgentRegistryConnectors", [
      "ps_agent_connector_class_id",
    ]);

    // Creating the AgentConnectors join table
    await queryInterface.createTable("AgentConnectors", {
      agent_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "ps_agents",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      connector_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "ps_agent_connectors",
          key: "id",
        },
        onDelete: "CASCADE",
      },
    });

    await queryInterface.addIndex("AgentConnectors", ["agent_id"]);
    await queryInterface.addIndex("AgentConnectors", ["connector_id"]);

    // Creating the AgentConnectors join table
    await queryInterface.createTable("AgentModels", {
      agent_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "ps_agents",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      ai_model_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "ps_ai_models",
          key: "id",
        },
        onDelete: "CASCADE",
      },
    });

    await queryInterface.addIndex("AgentModels", ["agent_id"]);
    await queryInterface.addIndex("AgentModels", ["ai_model_id"]);
  },
};
