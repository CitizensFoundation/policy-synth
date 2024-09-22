import { Group, PsAgent, PsAgentClass, PsAgentConnector, PsAgentConnectorClass, sequelize, } from "../dbModels/index.js";
import { PsYourPrioritiesConnector } from "../connectors/collaboration/yourPrioritiesConnector.js";
export class AgentConnectorManager {
    async createConnector(agentId, connectorClassId, userId, name, type) {
        const transaction = await sequelize.transaction();
        try {
            const agent = (await PsAgent.findByPk(agentId));
            const connectorClass = await PsAgentConnectorClass.findByPk(connectorClassId, { attributes: ["id", "configuration", "class_base_id"] });
            const agentClass = (await PsAgentClass.findByPk(agent.class_id, {
                attributes: ["id", "configuration", "class_base_id"],
            }));
            if (!agent || !connectorClass || !agentClass) {
                await transaction.rollback();
                throw new Error("Agent or connector class not found");
            }
            console.log(`Creating connector for agent ${agentClass.id} version ${agentClass.version} ${JSON.stringify(agentClass.configuration, null, 2)}`);
            const newConnector = await PsAgentConnector.create({
                class_id: connectorClassId,
                user_id: userId,
                group_id: agent.group_id,
                configuration: {
                    name: name,
                    graphPosX: 200,
                    graphPosY: 200,
                    permissionNeeded: "readWrite",
                },
            }, { transaction });
            if (type === "input") {
                await agent.addInputConnector(newConnector, { transaction });
            }
            else {
                await agent.addOutputConnector(newConnector, { transaction });
            }
            await transaction.commit();
            //TODO: Make this more modular, a bit hardcoded
            if (agentClass &&
                connectorClass.class_base_id ===
                    PsYourPrioritiesConnector.YOUR_PRIORITIES_CONNECTOR_CLASS_BASE_ID &&
                process.env.PS_TEMP_AGENTS_FABRIC_GROUP_API_KEY &&
                process.env.PS_TEMP_AGENTS_FABRIC_GROUP_SERVER_PATH &&
                agentClass.configuration.defaultStructuredQuestions) {
                console.log(`Creating Your Priorities group for agent ${agent.id}`);
                try {
                    await this.createYourPrioritiesGroupAndUpdateAgent(agent, agentClass, newConnector);
                }
                catch (error) {
                    console.error("Error creating group:", error);
                }
            }
            else {
                // FUll debug fdor all teh parameters being checked above
                console.log("agentClass", agentClass);
                console.log("connectorClass.class_base_id", connectorClass.class_base_id);
                console.log("PsYourPrioritiesConnector.YOUR_PRIORITIES_CONNECTOR_CLASS_BASE_ID", PsYourPrioritiesConnector.YOUR_PRIORITIES_CONNECTOR_CLASS_BASE_ID);
                console.log("process.env.PS_TEMP_AGENTS_FABRIC_GROUP_API_KEY", process.env.PS_TEMP_AGENTS_FABRIC_GROUP_API_KEY);
                console.log("agentClass.configuration.defaultStructuredQuestions", agentClass.configuration.defaultStructuredQuestions);
                console.log("agent.configuration.answers", agent.configuration.answers);
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
        }
        catch (error) {
            await transaction.rollback();
            throw error;
        }
    }
    async createYourPrioritiesGroupAndUpdateAgent(agent, agentClass, agentConnector) {
        try {
            const agentGroup = (await Group.findByPk(agent.group_id, {
                attributes: ["community_id", "id"],
            }));
            if (!agentGroup) {
                throw new Error("Group not found");
            }
            const newGroup = (await this.createGroup(agentGroup.id, agentGroup.community_id, agent.user_id, agent.configuration.name, agent.configuration.name, agentClass.configuration.defaultStructuredQuestions));
            if (!newGroup) {
                throw new Error("Group creation failed");
            }
            // Initialize answers array if it doesn't exist
            /*if (!agentConnector.configuration.answers) {
              agentConnector.configuration.answers = [];
            }
      
            const groupIdAnswer: YpStructuredAnswer = {
              uniqueId: "groupId",
              value: newGroup.id,
            };
      
            const answerIndex = agentConnector.configuration.answers.findIndex(
              (answer) => answer.uniqueId === "groupId"
            );
      
            if (answerIndex === -1) {
              // Add new answer if it doesn't exist
              agentConnector.configuration.answers.push(groupIdAnswer);
            } else {
              // Update existing answer
              agentConnector.configuration.answers[answerIndex] = groupIdAnswer;
            }*/
            //TODO: Fix this after fixing how answers are stored, all round
            //@ts-ignore
            agentConnector.configuration["groupId"] = newGroup.id;
            agentConnector.changed("configuration", true);
            await agentConnector.save();
            return newGroup;
        }
        catch (error) {
            console.error("Error creating group and updating agent:", error);
            throw error;
        }
    }
    getHeaders() {
        if (process.env.PS_TEMP_AGENTS_FABRIC_GROUP_API_KEY) {
            return {
                "x-api-key": process.env.PS_TEMP_AGENTS_FABRIC_GROUP_API_KEY,
            };
        }
        else {
            return {};
        }
    }
    async createGroup(currentGroupId, communityId, userId, name, description, structuredQuestions) {
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
            hideAllTabs: "",
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
            .map(([key, value]) => encodeURIComponent(key) + "=" + encodeURIComponent(value))
            .join("&");
        try {
            const response = await fetch(`${process.env.PS_TEMP_AGENTS_FABRIC_GROUP_SERVER_PATH}/api/groups/${communityId}?agentFabricUserId=${userId}&agentFabricGroupId=${currentGroupId}`, {
                method: "POST",
                headers: {
                    ...this.getHeaders(),
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
        }
        catch (error) {
            console.error("Error creating group:", error);
            throw error;
        }
    }
    async updateConnectorConfiguration(connectorId, updatedConfig) {
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
    async addExistingConnector(groupId, agentId, connectorId, type) {
        const transaction = await sequelize.transaction();
        try {
            const agent = await PsAgent.findByPk(agentId);
            const connector = await PsAgentConnector.findByPk(connectorId);
            if (!agent || !connector) {
                await transaction.rollback();
                throw new Error("Agent or connector not found");
            }
            if (connector.group_id !== groupId) {
                await transaction.rollback();
                throw new Error("Connector does not belong to the specified group");
            }
            if (type === "input") {
                await agent.addInputConnector(connector, { transaction });
            }
            else {
                await agent.addOutputConnector(connector, { transaction });
            }
            await transaction.commit();
        }
        catch (error) {
            await transaction.rollback();
            throw error;
        }
    }
}
//# sourceMappingURL=agentConnectorManager.js.map