import { Transaction } from "sequelize";
import {
  PsAgent,
  PsAgentClass,
  PsAgentConnector,
  PsAgentConnectorClass,
  sequelize,
} from "../dbModels/index.js";
import { PsYourPrioritiesConnector } from "../connectors/collaboration/yourPrioritiesConnector.js";

export class AgentConnectorManager {
  public async createConnector(
    agentId: number,
    connectorClassId: number,
    name: string,
    type: "input" | "output"
  ): Promise<PsAgentConnector | null> {
    const transaction: Transaction = await sequelize.transaction();

    try {
      const agent = (await PsAgent.findByPk(agentId)) as PsAgent;
      const connectorClass = await PsAgentConnectorClass.findByPk(
        connectorClassId
      );

      const agentClass = await PsAgentClass.findByPk(agent.class_id);

      if (!agent || !connectorClass) {
        await transaction.rollback();
        throw new Error("Agent or connector class not found");
      }

      const newConnector = await PsAgentConnector.create(
        {
          class_id: connectorClassId,
          user_id: 1, //TODO: Make dynamic
          group_id: agent.group_id,
          configuration: {
            name: name,
            graphPosX: 200,
            graphPosY: 200,
            permissionNeeded: "readWrite" as PsAgentConnectorPermissionTypes,
          },
        },
        { transaction }
      );

      if (type === "input") {
        await agent.addInputConnector(newConnector, { transaction });
      } else {
        await agent.addOutputConnector(newConnector, { transaction });
      }

      await transaction.commit();

      //TODO: Make this more modular, a bit hardcoded
      if (
        agentClass &&
        connectorClass.class_base_id ===
          PsYourPrioritiesConnector.YOUR_PRIORITIES_CONNECTOR_CLASS_BASE_ID &&
        process.env.PS_TEMP_AGENTS_FABRIC_GROUP_API_KEY &&
        agentClass.configuration.defaultStructuredQuestions &&
        agent.configuration.answers &&
        agent.configuration.answers.length > 0
      ) {
        console.log(`Creating Your Priorities group for agent ${agent.id}`);
        try {
          await this.createYourPrioritiesGroupAndUpdateAgent(agent, agentClass);
        } catch (error) {
          console.error("Error creating group:", error);
        }
      }

      return await PsAgentConnector.findByPk(newConnector.id, {
        include: [
          { model: PsAgentConnectorClass, as: "Class" },
          {
            model: PsAgent,
            as: type === "input" ? "InputAgents" : "OutputAgents",
            through: { attributes: [] }, // This excludes join table attributes from the result
          },
        ],
      });
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async createYourPrioritiesGroupAndUpdateAgent(
    agent: PsAgent,
    agentClass: PsAgentClass
  ) {
    try {
      const group = (await this.createGroup(
        agent.group_id,
        agent.configuration.name,
        agent.configuration.name,
        agentClass.configuration.defaultStructuredQuestions!
      )) as YpGroupData;

      if (!group) {
        throw new Error("Group creation failed");
      }

      const answerIndex = agent.configuration.answers!.findIndex(
        (answer) => answer.uniqueId === "groupId"
      );

      if (answerIndex === undefined || answerIndex === -1) {
        throw new Error("Answer with uniqueId 'groupId' not found");
      }

      agent.configuration.answers![answerIndex].value = group.id;
      agent.changed("configuration", true);
      await agent.save();

      return group;
    } catch (error) {
      console.error("Error creating group and updating agent:", error);
      throw error;
    }
  }

  getHeaders(): { [key: string]: string } {
    if (process.env.PS_TEMP_AGENTS_FABRIC_GROUP_API_KEY) {
      return {
        "x-api-key": process.env.PS_TEMP_AGENTS_FABRIC_GROUP_API_KEY!,
      };
    } else {
      return {};
    }
  }

  async createGroup(
    communityId: number,
    name: string,
    description: string,
    structuredQuestions: any[]
  ) {
    const groupData = {
      name: name,
      description: description,
      appHomeScreenIconImageId: "",
      canAddNewPosts: "1",
      locationHidden: "1",
      allowGenerativeImages: "1",
      postDescriptionLimit: "",
      allowPostVideoUploads: "1",
      videoPostUploadLimitSec: "",
      allowPostAudioUploads: "1",
      audioPostUploadLimitSec: "",
      customTitleQuestionText: "",
      hideNameInputAndReplaceWith: "",
      customTabTitleNewLocation: "",
      customCategoryQuestionText: "",
      customFilterText: "",
      defaultLocationLongLat: "",
      forcePostSortMethodAs: "",
      descriptionTruncateAmount: "",
      structuredQuestions: JSON.stringify(structuredQuestions),
      structuredQuestionsJsonErrorInfo: "",
      structuredQuestionsInfo: "",
      alternativeTextForNewIdeaButton: "",
      alternativeTextForNewIdeaButtonClosed: "",
      alternativeTextForNewIdeaButtonHeader: "",
      alternativeTextForNewIdeaSaveButton: "",
      customThankYouTextNewPosts: "",
      canVote: "1",
      maxNumberOfGroupVotes: "",
      customVoteUpHoverText: "",
      customVoteDownHoverText: "",
      customRatingsText: "",
      customRatingsInfo: "",
      newPointOptional: "1",
      hideNewPointOnNewIdea: "1",
      pointCharLimit: "",
      alternativePointForHeader: "",
      alternativePointAgainstHeader: "",
      alternativePointForLabel: "",
      alternativePointAgainstLabel: "",
      videoPointUploadLimitSec: "",
      audioPointUploadLimitSec: "",
      customAdminCommentsTitle: "",
      defaultLocale: "",
      customBackURL: "",
      customBackName: "",
      optionalSortOrder: "",
      hideAllTabs: "1",
      actAsLinkToCommunityId: "",
      maxDaysBackForRecommendations: "",
      customUserNamePrompt: "",
      customTermsIntroText: "",
      externalGoalTriggerUrl: "",
      externalId: "",
      urlToReview: "",
      urlToReviewActionText: "",
      dataForVisualization: "",
      dataForVisualizationJsonError: "",
      access: "open_to_community",
      theme: JSON.stringify({ oneColorScheme: "tonal", variant: "monochrome" }),
      objectives: description,
      open_to_community: "1",
      groupType: "0",
      status: "active",
      endorsementButtons: "arrows",
      themeId: "",
      uploadedLogoImageId: "",
      uploadedHeaderImageId: "",
    };

    // Convert the data to x-www-form-urlencoded format
    const formBody = Object.entries(groupData)
      .map(
        ([key, value]) =>
          encodeURIComponent(key) + "=" + encodeURIComponent(value)
      )
      .join("&");

    try {
      const response = await fetch(`/api/groups/${communityId}`, {
        method: "POST",
        headers: {
          ...this.getHeaders()!,
          ...{
            "Content-Type": "application/x-www-form-urlencoded",
          },
        },
        body: formBody,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error("Error creating group:", error);
      throw error;
    }
  }

  public async updateConnectorConfiguration(
    connectorId: number,
    updatedConfig: Partial<PsAgentConnectorConfiguration>
  ): Promise<void> {
    const connector = await PsAgentConnector.findByPk(connectorId);

    if (!connector) {
      throw new Error("Connector not found");
    }

    // Merge the updated configuration with the existing one
    connector.configuration = {
      ...connector.configuration,
      ...updatedConfig,
    };

    await connector.save();
  }
}
