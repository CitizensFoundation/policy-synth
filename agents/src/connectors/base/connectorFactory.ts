import { PsAgent } from "../../dbModels/agent.js";
import { PsConnectorClassTypes } from "../../connectorTypes.js";
import { PsBaseDocumentConnector } from "../base/baseDocumentConnector.js";
import { PsBaseNotificationsConnector } from "../base/baseNotificationsConnector.js";
import { PsBaseCollaborationConnector } from "./baseCollaborationConnector.js";
import { PsGoogleDocsConnector } from "../documents/googleDocsConnector.js";
//import { PsMicrosoftWordConnector } from "../documents/microsoftWordConnector.js";
import { PsBaseDiscordAgent } from "../notifications/discordConnector.js";
//import { PsSlackConnector } from "../notifications/slackConnector.js";
import { PsYourPrioritiesConnector } from "../collaboration/yourPrioritiesConnector.js";
//import { PsGitHubConnector } from "../collaboration/gitHubConnector.js";

type PsBaseConnectorTypes =
  | PsBaseDocumentConnector
  | PsBaseNotificationsConnector
  | PsBaseCollaborationConnector;

export class PsConnectorFactory {
  static createConnector(
    connector: PsAgentConnectorAttributes,
    connectorClass: PsAgentConnectorClassAttributes,
    agent: PsAgent,
    memory: any
  ): PsBaseConnectorTypes | null {
    switch (connectorClass.configuration.classType) {
      case PsConnectorClassTypes.Document:
        return this.createDocumentConnector(
          connector,
          connectorClass,
          agent,
          memory
        );

      case PsConnectorClassTypes.NotificationsAndChat:
        return this.createNotificationsConnector(
          connector,
          connectorClass,
          agent,
          memory
        );

      case PsConnectorClassTypes.Collaboration:
        return this.createCollaborationConnector(
          connector,
          connectorClass,
          agent,
          memory
        );

      default:
        console.warn(
          `Unsupported connector type: ${connectorClass.configuration.classType}`
        );
        return null;
    }
  }

  private static createDocumentConnector(
    connector: PsAgentConnectorAttributes,
    connectorClass: PsAgentConnectorClassAttributes,
    agent: PsAgent,
    memory: any
  ): PsBaseDocumentConnector | null {
    switch (connectorClass.configuration.name) {
      case "Google Docs":
        return new PsGoogleDocsConnector(
          connector,
          connectorClass,
          agent,
          memory
        );
      case "Microsoft Word":
        /*return new PsMicrosoftWordConnector(
          connector,
          connectorClass,
          agent,
          memory
        );*/
      default:
        console.warn(
          `Unsupported document connector: ${connectorClass.configuration.name}`
        );
        return null;
    }
  }

  private static createNotificationsConnector(
    connector: PsAgentConnectorAttributes,
    connectorClass: PsAgentConnectorClassAttributes,
    agent: PsAgent,
    memory: any
  ): PsBaseNotificationsConnector | null {
    switch (connectorClass.configuration.name) {
      case "Discord":
        return new PsBaseDiscordAgent(
          connector,
          connectorClass,
          agent,
          memory,
          "",
          {}
        );
      case "Slack":
        //return new PsSlackConnector(connector, connectorClass, agent, memory);
      default:
        console.warn(
          `Unsupported notifications connector: ${connectorClass.configuration.name}`
        );
        return null;
    }
  }

  private static createCollaborationConnector(
    connector: PsAgentConnectorAttributes,
    connectorClass: PsAgentConnectorClassAttributes,
    agent: PsAgent,
    memory: any
  ): PsBaseCollaborationConnector | null {
    switch (connectorClass.configuration.name) {
      case "Your Priorities":
        return new PsYourPrioritiesConnector(
          connector,
          connectorClass,
          agent,
          memory
        );
      case "GitHub":
        //return new PsGitHubConnector(connector, connectorClass, agent, memory);
      default:
        console.warn(
          `Unsupported collaboration connector: ${connectorClass.configuration.name}`
        );
        return null;
    }
  }

  static getConnector(
    agent: PsAgent,
    memory: any,
    connectorType: PsConnectorClassTypes,
    isInput: boolean = true
  ): PsBaseConnectorTypes | null {
    const connectors = isInput ? agent.InputConnectors : agent.OutputConnectors;
    const connector = connectors?.find(
      (c) => c.Class?.configuration.classType === connectorType
    );

    if (connector && connector.Class) {
      return this.createConnector(connector, connector.Class, agent, memory);
    }

    return null;
  }
}
