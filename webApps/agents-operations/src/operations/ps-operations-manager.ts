import { PropertyValueMap, css, html, nothing } from 'lit';
import { property, customElement, query } from 'lit/decorators.js';

import { cache } from 'lit/directives/cache.js';
import { resolveMarkdown } from '../chatBot/litMarkdown.js';

import '@material/web/iconbutton/icon-button.js';
import '@material/web/progress/linear-progress.js';
import '@material/web/tabs/tabs.js';
import '@material/web/tabs/primary-tab.js';
import '@material/web/textfield/outlined-text-field.js';
import '@material/web/iconbutton/outlined-icon-button.js';
import '@material/web/button/filled-tonal-button.js';
import '@material/web/dialog/dialog.js';
import '@material/web/button/text-button.js';
import '@material/web/checkbox/checkbox.js';
import '@material/web/menu/menu.js';
import '@material/web/menu/menu-item.js';

import { MdOutlinedTextField } from '@material/web/textfield/outlined-text-field.js';

import '@material/web/button/filled-button.js';

import { MdTabs } from '@material/web/tabs/tabs.js';

import './ps-operations-view.js';
import './OpsServerApi.js';
import { OpsServerApi } from './OpsServerApi.js';

import './chat/agent-chat-assistant.js';
import { MdDialog } from '@material/web/dialog/dialog.js';
import { OpsStreamingAIResponse } from './OpsStreamingAIResponse.js';
import { PsOperationsView } from './ps-operations-view.js';
import { YpBaseElement } from '@yrpri/webapp/common/yp-base-element.js';
import '@yrpri/webapp/yp-survey/yp-structured-question-edit.js';

import { PsOperationsBaseNode } from './ps-operations-base-node.js';
import { YpStructuredQuestionEdit } from '@yrpri/webapp/yp-survey/yp-structured-question-edit.js';
import { PsBaseWithRunningAgentObserver } from '../base/PsBaseWithRunningAgent.js';

const TESTING = false;

const nodeTypes = ['agent', 'connector'];

@customElement('ps-operations-manager')
export class PsOperationsManager extends PsBaseWithRunningAgentObserver {
  @property({ type: Number })
  currentAgentId: number | undefined;

  @property({ type: Object })
  currentAgent: PsAgentAttributes | undefined;

  @property({ type: Boolean })
  isFetchingAgent = false;

  @property({ type: Object })
  nodeToEditInfo: PsAgentAttributes | PsAgentConnectorAttributes | undefined;

  @property({ type: Object })
  nodeToEdit: PsOperationsBaseNode | undefined;

  @property({ type: Array })
  allCausesExceptCurrentToEdit: PsOperationsBaseNode[] = [];

  @property({ type: Boolean })
  showDeleteConfirmation = false;

  @property({ type: Number })
  activeTabIndex = 0;

  @property({ type: String })
  currentlySelectedCauseIdToAddAsChild: string | undefined;

  @property({ type: String })
  AIConfigReview: string | undefined;

  @property({ type: Boolean })
  isReviewingAgent = false;

  @property({ type: Boolean })
  isCreatingAgent = false;

  @query('ps-operations-view')
  agentElement!: PsOperationsView;

  api: OpsServerApi;

  @property({ type: Object })
  nodeToAddCauseTo: PsOperationsBaseNode | undefined;
  wsMessageListener: ((event: any) => void) | undefined = undefined;

  currentStreaminReponse: OpsStreamingAIResponse | undefined;

  constructor() {
    super();
    this.api = new OpsServerApi();
    this.setupTestData();
  }

  setupTestData() {
    // Hard-coded data

    const titleQuestion: YpStructuredQuestionData = {
      uniqueId: 'name',
      text: 'Name',
      type: 'textField',
      maxLength: 200,
      required: false,
    };

    const googleDocsQuestions: YpStructuredQuestionData[] = [
      titleQuestion,
      {
        uniqueId: 'googleDocsId',
        text: 'Document ID',
        type: 'textField',
        maxLength: 200,
        required: false,
      },
      {
        uniqueId: 'googleServiceAccount',
        text: 'ServiceAccount JSON',
        type: 'textArea',
        rows: 10,
        required: false,
      },
    ];

    const discordQuestions: YpStructuredQuestionData[] = [
      titleQuestion,
      {
        uniqueId: 'discordBotToken',
        text: 'Bot Token',
        type: 'textField',
        maxLength: 200,
        required: false,
      },
      {
        uniqueId: 'discordChannelName',
        text: 'Discord Channel Name',
        type: 'textField',
        maxLength: 200,
        required: false,
      },
    ];

    const yourPrioritiesQuestions: YpStructuredQuestionData[] = [
      titleQuestion,
      {
        uniqueId: 'user_id',
        text: 'User ID',
        type: 'textField',
        maxLength: 200,
        required: false,
      },
      {
        uniqueId: 'userKey',
        text: 'User Key',
        type: 'textField',
        maxLength: 200,
        required: false,
      },
      {
        uniqueId: 'group_id',
        text: 'Group ID',
        type: 'textField',
        maxLength: 200,
        required: false,
      },
    ];

    const rootCausesQuestions: YpStructuredQuestionData[] = [
      titleQuestion,
      {
        uniqueId: 'problemStatement',
        text: 'Problem Statement',
        type: 'textArea',
        rows: 5,
        maxLength: 2500,
        required: false,
      },
      {
        uniqueId: 'rankingInstructions',
        text: 'Ranking Instructions',
        type: 'textArea',
        rows: 3,
        maxLength: 1000,
        required: false,
      },
      {
        uniqueId: 'howManySearchQueries',
        text: 'How many search queries',
        type: 'textField',
        maxLength: 200,
        subType: 'number',
        required: false,
      },
      {
        uniqueId: 'percentToUseSearchQueries',
        text: '% of top search queries to use',
        type: 'textField',
        maxLength: 200,
        subType: 'number',
        required: false,
      },
      {
        uniqueId: 'percentToUseSearchResults',
        text: '% of top search results to use',
        type: 'textField',
        maxLength: 200,
        subType: 'number',
        required: false,
      },
    ];

    const googleDocsConnectorClass: PsAgentConnectorClassAttributes = {
      id: 1,
      name: 'Google Docs',
      uuid: '1',
      version: 1,
      created_at: new Date(),
      updated_at: new Date(),
      user_id: 1,
      available: true,
      configuration: {
        description: 'Connector for Google Docs',
        imageUrl:
          'https://aoi-storage-production.citizens.is/ypGenAi/community/1/339c8468-eb12-4167-a719-606bde321dc2.png',
        iconName: 'docs',
        questions: googleDocsQuestions,
      },
    };

    const discordMarketResearchBotConnectorClass: PsAgentConnectorClassAttributes =
      {
        id: 2,
        name: 'Discord Bot',
        uuid: '1',
        version: 1,
        user_id: 1,
        created_at: new Date(),
        updated_at: new Date(),
        available: true,
        configuration: {
          description: 'Connector for Discord Market Research Bot',
          imageUrl:
            'https://aoi-storage-production.citizens.is/ypGenAi/community/1/7336a9fb-7512-4c31-ae77-0bb7c5a99b97.png',
          iconName: 'discord',
          questions: discordQuestions,
        },
      };

    const yourPrioritiesConnectorClass: PsAgentConnectorClassAttributes = {
      id: 3,
      name: 'Your Priorities',
      uuid: '1',
      version: 1,
      user_id: 1,
      created_at: new Date(),
      updated_at: new Date(),
      available: true,
      configuration: {
        description: 'Connector for Your Priorities',
        imageUrl:
          'https://aoi-storage-production.citizens.is/ypGenAi/community/1/0a10f369-185b-40dc-802a-c2d78e6aab6d.png',
        iconName: 'yourPriorities',
        questions: yourPrioritiesQuestions,
      },
    };

    const allOurIdeasConnectorClass: PsAgentConnectorClassAttributes = {
      id: 4,
      name: 'All Our Ideas',
      uuid: '1',
      version: 1,
      user_id: 1,
      created_at: new Date(),
      updated_at: new Date(),
      available: true,
      configuration: {
        description: 'Connector for All Our Ideas',
        imageUrl:
          'https://aoi-storage-production.citizens.is/ypGenAi/community/1/30582554-20a7-4de5-87a4-4540dc2030b4.png',
        iconName: 'allOurIdeas',
        questions: [],
      },
    };

    const googleSheetsConnectorClass: PsAgentConnectorClassAttributes = {
      id: 5,
      name: 'Google Sheets',
      uuid: '1',
      version: 1,
      user_id: 1,
      available: true,
      created_at: new Date(),
      updated_at: new Date(),
      configuration: {
        description: 'Connector for All ',

        imageUrl:
          'https://aoi-storage-production.citizens.is/ypGenAi/community/1/1187aee2-39e8-48b2-afa2-0aba91c0ced0.png',
        iconName: 'googleSheets',
        questions: [],
      },
    };

    const smarterCrowdsourcingAgentClass: PsAgentClassAttributes = {
      id: 1,
      version: 1,
      name: 'Smarter Crowdsourcing Agent',
      uuid: '1',
      user_id: 1,
      created_at: new Date(),
      updated_at: new Date(),
      available: true,
      configuration: {
        description: 'An agent for running the Smarter Crowdsourcing process',
        imageUrl:
          'https://aoi-storage-production.citizens.is/ypGenAi/community/1/6d4368ce-ecaf-41ab-abb3-65ceadbdb2a6.png',
        iconName: 'smarter_crowdsourcing',
        assistantSystemInstructions: 'Explain the process',
        capabilities: ['research', 'analysis'],
        inputJsonInterface: '{}',
        outputJsonInterface: '{}',
        questions: rootCausesQuestions,
        supportedConnectors: [
          googleDocsConnectorClass,
          discordMarketResearchBotConnectorClass,
        ],
      },
    };

    const rootCausesSubAgentClass: PsAgentClassAttributes = {
      id: 2,
      version: 1,
      uuid: '1',
      user_id: 1,
      available: true,
      created_at: new Date(),
      updated_at: new Date(),

      name: 'Root Causes Research',
      configuration: {
        description: 'Root causes research sub-agent',
        imageUrl:
          'https://aoi-storage-production.citizens.is/ypGenAi/community/1/08d596cf-290e-4a1b-abff-74a305e3dbbb.png',
        iconName: 'root_causes_research',
        assistantSystemInstructions: 'Conduct root causes research',
        capabilities: ['research', 'analysis'],
        inputJsonInterface: '{}',
        outputJsonInterface: '{}',
        questions: rootCausesQuestions,
        supportedConnectors: [
          googleDocsConnectorClass,
          discordMarketResearchBotConnectorClass,
        ],
      },
    };

    const solutionsSubAgentClass: PsAgentClassAttributes = {
      id: 3,
      version: 1,
      uuid: '1',
      user_id: 1,
      available: true,
      created_at: new Date(),
      updated_at: new Date(),

      name: 'Solutions Search',
      configuration: {
        description: 'Sub-agent for solutions search',
        imageUrl:
          'https://aoi-storage-production.citizens.is/ypGenAi/community/1/6d4368ce-ecaf-41ab-abb3-65ceadbdb2a6.png',
        iconName: 'solutions_search',
        assistantSystemInstructions: 'Conduct solutions search',
        capabilities: ['research', 'analysis'],
        inputJsonInterface: '{}',
        outputJsonInterface: '{}',
        questions: rootCausesQuestions,
        supportedConnectors: [
          googleDocsConnectorClass,
          discordMarketResearchBotConnectorClass,
        ],
      },
    };

    const policyGenerationSubAgentClass: PsAgentClassAttributes = {
      id: 4,
      uuid: '1',
      user_id: 1,
      available: true,
      version: 1,
      created_at: new Date(),
      updated_at: new Date(),

      name: 'Generate Policies',
      configuration: {
        description: 'Sub-agent for generating policies',
        imageUrl:
          'https://aoi-storage-production.citizens.is/ypGenAi/community/1/b70ab7b3-7235-46b6-a3af-1a16eccee784.png',
        iconName: 'generate_policies',
        assistantSystemInstructions: 'Generate policies',
        capabilities: ['research', 'analysis', 'policyGeneration'],
        inputJsonInterface: '{}',
        outputJsonInterface: '{}',
        questions: rootCausesQuestions,
        supportedConnectors: [
          googleDocsConnectorClass,
          discordMarketResearchBotConnectorClass,
        ],
      },
    };

    interface PsGoogleDocsConfiguration
      extends PsAgentConnectorsBaseConfiguration {
      googleDocsId: string;
      googleServiceAccount: string;
    }

    const connectorGoogleDocsForRootCauses: PsAgentConnectorAttributes = {
      id: 1,
      class_id: 1,
      user_id: 1,
      group_id: 1,
      created_at: new Date(),
      updated_at: new Date(),

      User: {} as any, // populate with relevant YpUserData
      Group: {} as any, // populate with relevant YpGroupData
      uuid: '1',
      ApiCosts: [],
      ModelCosts: [],
      configuration: {
        name: 'Root Causes Summary',
        googleDocsId: '1sdfjkl3j4klj3',
        googleServiceAccount: '...',
        graphPosX: -5,
        graphPosY: 370,
        permissionNeeded: 'read',
      } as PsGoogleDocsConfiguration,

      Class: googleDocsConnectorClass,
    };

    const connectorGoogleSheetsForRootCauses: PsAgentConnectorAttributes = {
      id: 2,
      uuid: '1',
      ApiCosts: [],
      ModelCosts: [],
      class_id: 1,
      created_at: new Date(),
      updated_at: new Date(),

      user_id: 1,
      group_id: 1,
      User: {} as any, // populate with relevant YpUserData
      Group: {} as any, // populate with relevant YpGroupData
      //costs: [],
      configuration: {
        name: 'Root Causes Rows',
        googleDocsId: '1sdfjkl3j4klj3',
        googleServiceAccount: '...',
        graphPosX: 230,
        graphPosY: 540,
        permissionNeeded: 'read',
      } as PsGoogleDocsConfiguration,
      Class: googleSheetsConnectorClass,
    };

    const connectorGoogleSheetsForSolutions: PsAgentConnectorAttributes = {
      id: 3,
      uuid: '1',
      ApiCosts: [],
      ModelCosts: [],
      class_id: 1,
      user_id: 1,
      created_at: new Date(),
      updated_at: new Date(),

      group_id: 1,
      User: {} as any, // populate with relevant YpUserData
      Group: {} as any, // populate with relevant YpGroupData
      //costs: [],
      configuration: {
        name: 'Solutions Rows',
        googleDocsId: '1sdfjkl3j4klj3',
        googleServiceAccount: '...',
        graphPosX: 230,
        graphPosY: 540 + 800,
        permissionNeeded: 'read',
      } as PsGoogleDocsConfiguration,
      Class: googleSheetsConnectorClass,
    };

    const connectorGoogleSheetsForPolicies: PsAgentConnectorAttributes = {
      id: 4,
      uuid: '1',
      ApiCosts: [],
      ModelCosts: [],
      class_id: 1,
      created_at: new Date(),
      updated_at: new Date(),
      user_id: 1,
      group_id: 1,
      User: {} as any, // populate with relevant YpUserData
      Group: {} as any, // populate with relevant YpGroupData
      configuration: {
        name: 'Policies Rows',
        googleDocsId: '1sdfjkl3j4klj3',
        googleServiceAccount: '...',
        graphPosX: 230,
        graphPosY: 1050 + 1050,
        permissionNeeded: 'read',
      } as PsGoogleDocsConfiguration,

      Class: googleSheetsConnectorClass,
    };

    interface PsDiscordConfiguration
      extends PsAgentConnectorsBaseConfiguration {
      discordBotToken: string;
      discordChannelName: string;
    }

    const connectorDiscordRootCauses: PsAgentConnectorAttributes = {
      id: 5,
      class_id: 2,
      user_id: 1,
      group_id: 1,
      created_at: new Date(),
      updated_at: new Date(),
      User: {} as any, // populate with relevant YpUserData
      Group: {} as any, // populate with relevant YpGroupData
      uuid: '1',
      ApiCosts: [],
      ModelCosts: [],
      configuration: {
        name: 'Causes Notifications',
        discordBotToken: 'dasdsadsdsa',
        discordChannelName: 'root-causes-agent',
        graphPosX: 480,
        graphPosY: 300,
        permissionNeeded: 'readWrite',
      } as PsDiscordConfiguration,

      Class: discordMarketResearchBotConnectorClass,
    };

    const connectorDiscordSolutions: PsAgentConnectorAttributes = {
      id: 6,
      class_id: 2,
      user_id: 1,
      group_id: 1,
      created_at: new Date(),
      updated_at: new Date(),
      User: {} as any, // populate with relevant YpUserData
      Group: {} as any, // populate with relevant YpGroupData
      uuid: '1',
      ApiCosts: [],
      ModelCosts: [],
      configuration: {
        permissionNeeded: 'readWrite',
        name: 'Solutions Notifications',
        discordBotToken: 'dasdsadsdsa',
        discordChannelName: 'solutions-agent',
        graphPosX: 480,
        graphPosY: 300 + 800,
      } as PsDiscordConfiguration,

      Class: discordMarketResearchBotConnectorClass,
    };

    const connectorDiscordPolicies: PsAgentConnectorAttributes = {
      id: 7,
      class_id: 2,
      user_id: 1,
      created_at: new Date(),
      updated_at: new Date(),
      group_id: 1,
      User: {} as any, // populate with relevant YpUserData
      Group: {} as any, // populate with relevant YpGroupData
      uuid: '1',
      ApiCosts: [],
      ModelCosts: [],
      configuration: {
        permissionNeeded: 'readWrite',
        name: 'Notifications & Remote Control',
        discordBotToken: 'dasdsadsdsa',
        discordChannelName: 'policies-agent',
        graphPosX: 480,
        graphPosY: 800 + 1050,
      } as PsDiscordConfiguration,

      Class: discordMarketResearchBotConnectorClass,
    };

    interface PsYourPrioritiesConfiguration
      extends PsAgentConnectorsBaseConfiguration {
      user_id: string;
      userKey: string;
      group_id: string;
    }

    const connectorYourPrioritiesSolutions: PsAgentConnectorAttributes = {
      id: 8,
      class_id: 2,
      user_id: 1,
      group_id: 1,
      User: {} as any, // populate with relevant YpUserData
      Group: {} as any, // populate with relevant YpGroupData
      uuid: '1',
      ApiCosts: [],
      created_at: new Date(),
      updated_at: new Date(),
      ModelCosts: [],
      configuration: {
        permissionNeeded: 'readWrite',
        name: 'Human Solutions',
        user_id: 'planxbot@hugsmidi.is',
        userKey: '12345',
        group_id: '31298',
        graphPosX: -5,
        graphPosY: 230 + 800,
      } as PsYourPrioritiesConfiguration,

      Class: yourPrioritiesConnectorClass,
    };

    const connectorYourPrioritiesPolicies: PsAgentConnectorAttributes = {
      id: 9,
      class_id: 2,
      user_id: 1,
      group_id: 1,
      created_at: new Date(),
      updated_at: new Date(),
      User: {} as any, // populate with relevant YpUserData
      Group: {} as any, // populate with relevant YpGroupData
      uuid: '1',
      ApiCosts: [],
      ModelCosts: [],
      configuration: {
        name: 'Policy Ideas Deliberation',
        user_id: 'planxbot@hugsmidi.is',
        userKey: '12345',
        group_id: '31299',
        graphPosX: -10,
        graphPosY: 750 + 1050,
        permissionNeeded: 'readWrite',
      } as PsYourPrioritiesConfiguration,

      Class: yourPrioritiesConnectorClass,
    };

    const connectorAllOurIdeasRootCauses: PsAgentConnectorAttributes = {
      id: 10,
      class_id: 2,
      created_at: new Date(),
      updated_at: new Date(),
      user_id: 1,
      group_id: 1,
      User: {} as any, // populate with relevant YpUserData
      Group: {} as any, // populate with relevant YpGroupData
      uuid: '1',
      ApiCosts: [],
      ModelCosts: [],
      configuration: {
        permissionNeeded: 'readWrite',
        name: 'Rank Root Causes',
        user_id: 'planxbot@hugsmidi.is',
        userKey: '12345',
        group_id: '31299',
        graphPosX: 230,
        graphPosY: 780,
      } as PsYourPrioritiesConfiguration,

      Class: allOurIdeasConnectorClass,
    };

    const connectorAllOurIdeasSolutions: PsAgentConnectorAttributes = {
      id: 11,
      class_id: 2,
      user_id: 1,
      group_id: 1,
      created_at: new Date(),
      updated_at: new Date(),
      User: {} as any, // populate with relevant YpUserData
      Group: {} as any, // populate with relevant YpGroupData
      uuid: '1',
      ApiCosts: [],
      ModelCosts: [],
      configuration: {
        permissionNeeded: 'readWrite',
        name: 'Rank Solutions',
        user_id: 'planxbot@hugsmidi.is',
        userKey: '12345',
        group_id: '31299',
        graphPosX: 230,
        graphPosY: 780 + 800,
      } as PsYourPrioritiesConfiguration,

      Class: allOurIdeasConnectorClass,
    };

    const connectorAllOurIdeasPolicies: PsAgentConnectorAttributes = {
      id: 12,
      class_id: 2,
      user_id: 1,
      group_id: 1,
      created_at: new Date(),
      updated_at: new Date(),
      User: {} as any, // populate with relevant YpUserData
      Group: {} as any, // populate with relevant YpGroupData
      uuid: '1',
      ApiCosts: [],
      ModelCosts: [],
      configuration: {
        permissionNeeded: 'readWrite',
        name: 'Rank Policies',
        user_id: 'planxbot@hugsmidi.is',
        userKey: '12345',
        group_id: '31299',
        graphPosX: 230,
        graphPosY: 1280 + 1050,
      } as PsYourPrioritiesConfiguration,

      Class: allOurIdeasConnectorClass,
    };

    interface PsCompetitorsResearchConfiguration
      extends PsAgentConnectorsBaseConfiguration {
      howManySearchQueries: number;
      percentToUseSearchQueries: number;
      percentToUseSearchResults: number;
    }

    const subAgent1: PsAgentAttributes = {
      id: 2,
      class_id: 2,
      user_id: 1,
      group_id: 1,
      created_at: new Date(),
      updated_at: new Date(),
      User: {} as any, // populate with relevant YpUserData
      Group: {} as any, // populate with relevant YpGroupData
      uuid: '1',
      ApiCosts: [],
      ModelCosts: [],
      configuration: {
        name: 'Unlocking Literacy',
        howManySearchQueries: 10,
        percentToUseSearchQueries: 50,
        percentToUseSearchResults: 50,
        graphPosX: 200,
        graphPosY: 250,
      } as PsCompetitorsResearchConfiguration,

      Class: rootCausesSubAgentClass,
      parent_agent_id: 1,
      parentAgent: undefined,
      SubAgents: undefined,
      Connectors: [
        connectorGoogleDocsForRootCauses,
        connectorDiscordRootCauses,
        connectorAllOurIdeasRootCauses,
        connectorGoogleSheetsForRootCauses,
      ],
    };

    interface PsUseCaseResearchConfiguration
      extends PsAgentConnectorsBaseConfiguration {
      howManySearchQueries: number;
      percentToUseSearchQueries: number;
      percentToUseSearchResults: number;
    }

    const subAgent2: PsAgentAttributes = {
      id: 3,
      class_id: 3,
      user_id: 1,
      created_at: new Date(),
      updated_at: new Date(),
      group_id: 1,
      User: {} as any, // populate with relevant YpUserData
      Group: {} as any, // populate with relevant YpGroupData
      uuid: '1',
      ApiCosts: [],
      ModelCosts: [],
      configuration: {
        name: 'Unlocking Literacy',
        howManySearchQueries: 10,
        percentToUseSearchQueries: 50,
        percentToUseSearchResults: 50,
        graphPosX: 200,
        graphPosY: 250 + 800,
      } as PsUseCaseResearchConfiguration,

      Class: solutionsSubAgentClass,
      parent_agent_id: 1,
      parentAgent: undefined,
      SubAgents: undefined,
      Connectors: [
        connectorGoogleSheetsForSolutions,
        connectorDiscordSolutions,
        connectorYourPrioritiesSolutions,
        connectorAllOurIdeasSolutions,
      ],
    };

    const subAgent3: PsAgentAttributes = {
      id: 4,
      class_id: 4,
      user_id: 1,
      created_at: new Date(),
      updated_at: new Date(),
      group_id: 1,
      User: {} as any, // populate with relevant YpUserData
      Group: {} as any, // populate with relevant YpGroupData
      uuid: '1',
      ApiCosts: [],
      ModelCosts: [],
      configuration: {
        name: 'Smarter Crowdsourcing',
        graphPosX: 200,
        graphPosY: 760 + 1050,
      },

      Class: policyGenerationSubAgentClass,
      parent_agent_id: 1,
      parentAgent: undefined,
      SubAgents: undefined,
      Connectors: [
        connectorYourPrioritiesPolicies,
        connectorDiscordPolicies,
        connectorGoogleSheetsForPolicies,
        connectorAllOurIdeasPolicies,
      ],
    };

    const smarterCrowdsourcingAgent: PsAgentAttributes = {
      id: 1,
      class_id: 1,
      created_at: new Date(),
      updated_at: new Date(),
      user_id: 1,
      group_id: 1,
      User: {} as any, // populate with relevant YpUserData
      Group: {} as any, // populate with relevant YpGroupData
      uuid: '1',
      ApiCosts: [],
      ModelCosts: [],
      configuration: {
        graphPosX: 0,
        graphPosY: 0,
        name: 'Smarter Crowdsourcing',
      },

      Class: smarterCrowdsourcingAgentClass,
      parent_agent_id: undefined,
      parentAgent: undefined,
      SubAgents: [subAgent1, subAgent2, subAgent3],
      Connectors: undefined,
    };

    this.currentAgent = smarterCrowdsourcingAgent;

    window.psAppGlobals.addToAgentsRegistry(smarterCrowdsourcingAgent);
    window.psAppGlobals.addToAgentsRegistry(subAgent1);
    window.psAppGlobals.addToAgentsRegistry(subAgent2);
    window.psAppGlobals.addToAgentsRegistry(subAgent3);

    window.psAppGlobals.addToConnectorsRegistry(
      connectorGoogleDocsForRootCauses
    );
    window.psAppGlobals.addToConnectorsRegistry(connectorDiscordRootCauses);
    window.psAppGlobals.addToConnectorsRegistry(connectorDiscordSolutions);
    window.psAppGlobals.addToConnectorsRegistry(
      connectorYourPrioritiesSolutions
    );
    window.psAppGlobals.addToConnectorsRegistry(
      connectorGoogleSheetsForRootCauses
    );
    window.psAppGlobals.addToConnectorsRegistry(
      connectorGoogleSheetsForSolutions
    );
    window.psAppGlobals.addToConnectorsRegistry(
      connectorGoogleSheetsForPolicies
    );
    window.psAppGlobals.addToConnectorsRegistry(connectorAllOurIdeasRootCauses);
    window.psAppGlobals.addToConnectorsRegistry(connectorAllOurIdeasSolutions);
    window.psAppGlobals.addToConnectorsRegistry(connectorAllOurIdeasPolicies);
    window.psAppGlobals.addToConnectorsRegistry(
      connectorYourPrioritiesPolicies
    );
    window.psAppGlobals.addToConnectorsRegistry(connectorDiscordPolicies);
    window.psAppGlobals.addToConnectorsRegistry(
      connectorGoogleSheetsForPolicies
    );
    window.psAppGlobals.addToConnectorsRegistry(
      connectorGoogleSheetsForSolutions
    );
    window.psAppGlobals.addToConnectorsRegistry(
      connectorGoogleSheetsForRootCauses
    );
    window.psAppGlobals.addToConnectorsRegistry(connectorDiscordSolutions);

    window.psAppGlobals.addToConnectorsRegistry(
      connectorYourPrioritiesPolicies
    );
    window.psAppGlobals.addToConnectorsRegistry(
      connectorYourPrioritiesSolutions
    );
  }

  override async connectedCallback() {
    super.connectedCallback();
    this.addEventListener(
      'open-add-cause-dialog',
      this.openAddCauseDialog as EventListenerOrEventListenerObject
    );

    this.addEventListener(
      'close-add-cause-dialog',
      this.closeAddCauseDialog as EventListenerOrEventListenerObject
    );

    if (this.currentAgentId) {
      this.fetchCurrentAgent();
    }

    this.addEventListener(
      'edit-node',
      this.openEditNodeDialog as EventListenerOrEventListenerObject
    );
  }

  openEditNodeDialog(event: CustomEvent) {
    this.nodeToEditInfo = event.detail.element;

    this.currentlySelectedCauseIdToAddAsChild = undefined;

    /*this.nodeToEdit = this.findNodeRecursively(
      this.currentAgent?.SubAgents || [],
      this.nodeToEditInfo!.nodeId
    );
    if (!this.nodeToEdit) {
      console.error(`Could not find node ${this.nodeToEditInfo!.nodeId}`);
      console.error(JSON.stringify(this.currentAgent, null, 2));
      return;
    }

    const childrenIds = (this.nodeToEdit.children || []).map(
      (child) => child.id
    );
    childrenIds.push(this.nodeToEdit.id);

    this.allCausesExceptCurrentToEdit =
      this.agentElement!.getAllCausesExcept(childrenIds);*/

    (this.$$('#editNodeDialog') as MdDialog).show();
  }

  saveAnswers() {
    for (
      let a = 0;
      a < this.nodeToEditInfo.Class.configuration.questions.length;
      a++
    ) {
      const questionElement = this.$$(
        '#structuredQuestion_' + a
      ) as YpStructuredQuestionEdit;
      if (questionElement) {
        const answer = questionElement.getAnswer();
        //TODO: See if we can solve the below without any without adding much complexity
        if (answer && questionElement.question.uniqueId) {
          (this.nodeToEditInfo.configuration as any)[
            questionElement.question.uniqueId
          ] = answer.value;
        }
      }
    }
  }

  closeEditNodeDialog() {
    (this.$$('#editNodeDialog') as MdDialog).close();
    this.nodeToEdit = undefined;
    this.nodeToEditInfo = undefined;
  }

  addChildChanged() {
    const effectIdSelect = this.$$('#addEffectToNodeId') as HTMLSelectElement;
    this.currentlySelectedCauseIdToAddAsChild = effectIdSelect.value;
  }

  async handleSaveEditNode() {
    this.saveAnswers();
    this.closeEditNodeDialog();

    if (this.currentAgentId) {
      try {
        await this.api.updateNode(this.currentAgentId, this.nodeToEdit);

        this.closeEditNodeDialog();
        //TODO: Do this with less brute force, actually update the element
        this.currentAgent = { ...this.currentAgent };
      } catch (error) {
        console.error('Error updating node:', error);
      }
    }
  }

  handleDeleteNode() {
    this.showDeleteConfirmation = true;
  }

  removeNodeRecursively(nodes: PsOperationsBaseNode[], nodeId: string) {
    const index = nodes.findIndex(node => node.id === nodeId);
    if (index !== -1) {
      nodes.splice(index, 1);
      return;
    }
    nodes.forEach(node => {
      if (node.children) {
        //this.removeNodeRecursively(node.SubAgents, nodeId);
      }
    });
  }

  async confirmDeleteNode() {
    if (this.nodeToEdit && this.currentAgentId) {
      try {
        await this.api.deleteNode(this.currentAgentId, this.nodeToEdit.id);

        // Remove the node from the agent object
        // this.removeNodeRecursively(this.currentAgent?.SubAgents || [], this.nodeToEdit.id);
        this.closeEditNodeDialog();
        this.currentAgent = { ...this.currentAgent };
      } catch (error) {
        console.error('Error deleting node:', error);
      } finally {
        this.closeDeleteConfirmationDialog();
      }
    }
  }

  createDirectCauses() {
    if (this.nodeToEditInfo) {
      //this.nodeToEditInfo.element.createDirectCauses();
    }

    this.closeEditNodeDialog();
  }
  closeDeleteConfirmationDialog() {
    this.showDeleteConfirmation = false;
  }

  renderDeleteConfirmationDialog() {
    return html`
      <md-dialog
        id="deleteConfirmationDialog"
        ?open="${this.showDeleteConfirmation}"
        @closed="${() => (this.showDeleteConfirmation = false)}"
      >
        <div slot="headline">Confirm Deletion</div>
        <div slot="content">Are you sure you want to delete this node?</div>
        <div slot="actions">
          <md-text-button @click="${this.closeDeleteConfirmationDialog}">
            Cancel
          </md-text-button>
          <md-text-button @click="${this.confirmDeleteNode}">
            Delete
          </md-text-button>
        </div>
      </md-dialog>
    `;
  }

  _saveNodeEditState(event: CustomEvent) {}

  renderNodeEditHeadline() {
    return html`
      <div class="layout horizontal">
        <div>
          <img
            src="${this.nodeToEditInfo.Class.configuration.imageUrl}"
            class="nodeEditHeadlineImage"
          />
        </div>
        <div class="nodeEditHeadlineTitle">
          ${this.nodeToEditInfo.Class.name}
        </div>
      </div>
    `;
  }

  renderEditNodeDialog() {
    let initiallyLoadedAnswers = [] as any;

    if (this.nodeToEditInfo) {
      // Convert this.nodeToEditInfo.configuration object to array with { "uniqueId": key, "value": value }
      initiallyLoadedAnswers = Object.entries(
        this.nodeToEditInfo.configuration
      ).map(([key, value]) => ({
        uniqueId: key,
        value: value,
      }));
    }
    return html`
      <md-dialog
        id="editNodeDialog"
        style="width: 800px; max-height: 90vh;"
        @closed="${this.closeEditNodeDialog}"
      >
        <div slot="headline">
          ${this.nodeToEditInfo ? this.renderNodeEditHeadline() : ''}
        </div>
        <div
          slot="content"
          id="editNodeForm"
          style="max-height: 90vh;height: 500px;"
          class="layout vertical"
        >
          ${this.nodeToEditInfo
            ? html`
                <div id="surveyContainer">
                  ${this.nodeToEditInfo.Class.configuration.questions.map(
                    (question, index) => html`
                      <yp-structured-question-edit
                        index="${index}"
                        id="structuredQuestion_${question.uniqueId
                          ? index
                          : `noId_${index}`}"
                        .structuredAnswers="${initiallyLoadedAnswers}"
                        @changed="${this._saveNodeEditState}"
                        .question="${question}"
                      >
                      </yp-structured-question-edit>
                    `
                  )}
                </div>
              `
            : nothing}
        </div>
        <div slot="actions">
          <md-text-button
            hidden
            @click="${this.handleDeleteNode}"
            class="deleteButton"
          >
            Delete
          </md-text-button>
          <div class="flex"></div>
          <md-text-button @click="${this.closeEditNodeDialog}" value="cancel">
            Cancel
          </md-text-button>
          <md-text-button @click="${this.handleSaveEditNode}" value="ok">
            Save
          </md-text-button>
        </div>
      </md-dialog>
    `;
  }

  updatePath() {
    const dontDoIt = false;
    if (!dontDoIt) {
      if (this.currentAgent && this.currentAgent.id) {
        window.history.pushState({}, '', `/agent/${this.currentAgent.id}`);
      } else {
        console.error('Could not fetch current tree: ' + this.currentAgentId);
      }
    }
  }

  async fetchCurrentAgent() {
    this.isFetchingAgent = true;

    //this.currentAgent = undefined; //  await this.api.getAgent(this.currentAgentId as number);

    this.isFetchingAgent = false;

    if (false && this.currentAgent) {
      this.updatePath();

      await this.updateComplete;

      (this.$$('#context') as MdOutlinedTextField).value =
        this.currentAgent.Class.configuration.description;
      (this.$$('#undesirableEffects') as MdOutlinedTextField).value = '';

      this.activeTabIndex = 1;
      (this.$$('#tabBar') as MdTabs).activeTabIndex = 1;
    }
  }

  override updated(
    changedProperties: Map<string | number | symbol, unknown>
  ): void {
    super.updated(changedProperties);
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.removeEventListener(
      'open-add-cause-dialog',
      this.openAddCauseDialog as EventListenerOrEventListenerObject
    );
    this.removeEventListener(
      'close-add-cause-dialog',
      this.closeAddCauseDialog as EventListenerOrEventListenerObject
    );
  }
  camelCaseToHumanReadable(str: string) {
    // Split the string at each uppercase letter and join with space
    const words = str.replace(/([A-Z])/g, ' $1').trim();

    // Capitalize the first letter of the resulting string
    return words.charAt(0).toUpperCase() + words.slice(1);
  }

  static override get styles() {
    return [
      super.styles,
      css`
        md-tabs {
          margin-bottom: 64px;
        }

        .nodeEditHeadlineImage {
          max-width: 100px;
          margin-right: 16px;
        }

        .nodeEditHeadlineTitle {
          display: flex;
          align-items: center;
          justify-content: center; /* This will also center the content horizontally */
          height: 55px; /* Make sure this element has a defined height */
        }

        .childEditing {
          color: var(--md-sys-color-on-surface-variant);
          background-color: var(--md-sys-color-surface-variant);
          padding: 16px;
          border-radius: 8px;
        }

        .childrenList {
          height: 100px;
          overflow-y: auto;
        }

        md-icon-button {
          margin-top: 32px;
        }

        .createOptionsButtons {
          display: flex;
          justify-content: center;
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          padding-left: 8px;
          padding-right: 8px;
        }

        .deleteButton {
          --md-sys-color-primary: var(--md-sys-color-error);
        }

        md-circular-progress {
          margin-bottom: 6px;
        }

        md-filled-text-field,
        md-outlined-text-field {
          width: 600px;
          margin-bottom: 16px;
        }

        [type='textarea'] {
          min-height: 150px;
        }

        [type='textarea'][supporting-text] {
          min-height: 76px;
        }

        .formContainer {
          margin-top: 32px;
        }

        md-filled-button,
        md-outlined-button {
          margin-top: 8px;
          margin-left: 8px;
          margin-right: 8px;
          margin-bottom: 8px;
        }

        .aiConfigReview {
          margin-left: 8px;
          margin-right: 8px;
          padding: 16px;
          margin-top: 8px;
          margin-bottom: 8px;
          border-radius: 12px;
          max-width: 560px;
          font-size: 14px;
          background-color: var(--md-sys-color-primary-container);
          color: var(--md-sys-color-on-primary-container);
        }

        .agentUDEDescription {
          font-size: 18px;
          margin: 32px;
          margin-bottom: 0;
          padding: 24px;
          border-radius: 12px;
          background-color: var(--md-sys-color-primary);
          color: var(--md-sys-color-on-primary);
        }

        md-tabs,
        agent-tab,
        configure-tab {
          width: 100%;
        }

        .themeToggle {
          margin-top: 32px;
        }

        ltp-chat-assistant {
          height: 100%;
          max-height: 100%;
          width: 100%;
          height: 100%;
        }

        md-linear-progress {
          width: 600px;
        }

        .darkModeButton {
          margin-right: 8px;
          margin-left: 8px;
        }

        .topDiv {
          margin-bottom: 256px;
        }

        md-outlined-select {
          z-index: 1500px;
          margin: 16px;
          margin-left: 0;
          max-width: 250px;
        }

        .automaticCreateButton {
          max-width: 300px;
        }

        [hidden] {
          display: none !important;
        }
      `,
    ];
  }

  tabChanged() {
    this.activeTabIndex = (this.$$('#tabBar') as MdTabs).activeTabIndex;
  }

  clearForNew() {
    this.currentAgent = undefined;
    this.currentAgentId = undefined;
    this.AIConfigReview = undefined;
    (this.$$('#context') as MdOutlinedTextField).value = '';
    (this.$$('#undesirableEffects') as MdOutlinedTextField).value = '';
    //window.history.pushState({}, '', `/agent`);
  }

  get agentInputData() {
    return {
      description:
        (this.$$('#description') as MdOutlinedTextField)?.value ?? '',
      context: (this.$$('#context') as MdOutlinedTextField).value ?? '',
      undesirableEffects:
        (this.$$('#undesirableEffects') as MdOutlinedTextField).value.split(
          '\n'
        ) ?? [],
      nodes: [],
    } as any; //LtpCurrentRealityAgentData;
  }

  async reviewAgentConfiguration() {
    this.isReviewingAgent = true;

    if (this.currentStreaminReponse) {
      this.currentStreaminReponse.close();
    }

    if (this.wsMessageListener) {
      this.removeEventListener('wsMessage', this.wsMessageListener);
    }

    this.AIConfigReview = undefined;

    this.currentStreaminReponse = new OpsStreamingAIResponse(this);

    try {
      const wsClientId = await this.currentStreaminReponse.connect();
      this.AIConfigReview = '';
      console.log('Connected with clientId:', wsClientId);

      this.wsMessageListener = (event: any) => {
        const { data } = event.detail;
        if (data.type === 'part' && data.text) {
          this.AIConfigReview += data.text;
        } else if (data.type === 'end') {
          this.removeListener('wsMessage', this.wsMessageListener!);
          this.wsMessageListener = undefined;
          this.currentStreaminReponse = undefined;
          this.isReviewingAgent = false;
        }
      };

      this.addEventListener('wsMessage', this.wsMessageListener);

      await this.api.reviewConfiguration(wsClientId, this.agentInputData);

      // Proceed with your logic
    } catch (error) {
      console.error('WebSocket connection failed:', error);
      this.removeListener('wsMessage', this.wsMessageListener!);
    }
  }

  async createAgent() {
    this.isCreatingAgent = true;

    const agentSeed = this.agentInputData;

    if (TESTING && (this.$$('#context') as MdOutlinedTextField).value == '') {
      agentSeed.context =
        'We are a software company with a product we have as as service';
      agentSeed.undesirableEffects = ['End users are unhappy with the service'];
    }

    //this.currentAgent = await this.api.createAgent(agentSeed);

    this.updatePath();

    this.isCreatingAgent = false;
    this.activeTabIndex = 1;
    (this.$$('#tabBar') as MdTabs).activeTabIndex = 1;
  }

  toggleDarkMode() {
    this.fire('yp-theme-dark-mode', !this.themeDarkMode);
    window.psAppGlobals.activity('Agent - toggle darkmode');
    if (this.themeDarkMode) {
      window.psAppGlobals.activity('Settings - dark mode');
      localStorage.setItem('md3-ps-dark-mode', 'true');
    } else {
      window.psAppGlobals.activity('Settings - light mode');
      localStorage.removeItem('md3-ps-dark-mode');
    }
  }

  randomizeTheme() {
    // Create a random hex color
    const randomColor = Math.floor(Math.random() * 16777215).toString(16);
    // Set the theme color
    this.fire('yp-theme-color', `#${randomColor}`);
  }

  renderAIConfigReview() {
    return html`
      <div class="aiConfigReview" id="aiConfigReview">
        ${this.AIConfigReview
          ? html`
              ${resolveMarkdown(this.AIConfigReview, {
                includeImages: true,
                includeCodeBlockClassNames: true,
              })}
            `
          : nothing}
      </div>
    `;
  }

  renderReviewAndSubmit() {
    return html`
      <md-outlined-button
        @click="${this.reviewAgentConfiguration}"
        ?hidden="${!this.AIConfigReview || this.currentAgent != undefined}"
        >${this.t('Review CRT again')}<md-icon slot="icon"
          >rate_review</md-icon
        ></md-outlined-button
      >
      <md-filled-button
        @click="${this.reviewAgentConfiguration}"
        ?hidden="${this.AIConfigReview != undefined ||
        this.currentAgent != undefined}"
        ?disabled="${this.isReviewingAgent}"
        >${this.t('Review CRT')}<md-icon slot="icon"
          >rate_review</md-icon
        ></md-filled-button
      >
    `;
  }

  renderThemeToggle() {
    return html`<div class="layout horizontal center-center themeToggle">
      ${!this.themeDarkMode
        ? html`
            <md-outlined-icon-button
              class="darkModeButton"
              @click="${this.toggleDarkMode}"
              ><md-icon>dark_mode</md-icon></md-outlined-icon-button
            >
          `
        : html`
            <md-outlined-icon-button
              class="darkModeButton"
              @click="${this.toggleDarkMode}"
              ><md-icon>light_mode</md-icon></md-outlined-icon-button
            >
          `}

      <md-outlined-icon-button
        class="darkModeButton"
        @click="${this.randomizeTheme}"
        ><md-icon>shuffle</md-icon></md-outlined-icon-button
      >
    </div> `;
  }

  renderConfiguration() {
    return html`
      <div class="layout vertical center-center topDiv">
        ${this.renderThemeToggle()}

        <div class="formContainer">
          <div>
            <md-outlined-text-field
              type="textarea"
              label="Context"
              id="context"
            ></md-outlined-text-field>
          </div>

          <div>
            <md-outlined-text-field
              type="textarea"
              label="Undesirable Effects"
              id="undesirableEffects"
            ></md-outlined-text-field>
          </div>

          <div class="layout horizontal center-center">
            <md-outlined-button
              @click="${this.clearForNew}"
              ?hidden="${!this.currentAgent}"
              >${this.t('Create New Agent')}<md-icon slot="icon"
                >rate_review</md-icon
              ></md-outlined-button
            >

            ${this.renderReviewAndSubmit()}

            <md-filled-button
              @click="${this.createAgent}"
              ?hidden="${!this.AIConfigReview ||
              this.currentAgent != undefined}"
              ?disabled="${this.isReviewingAgent}"
              >${this.t('Create CRT')}<md-icon slot="icon"
                >send</md-icon
              ></md-filled-button
            >
          </div>

          ${this.isReviewingAgent && !this.AIConfigReview
            ? html`<md-linear-progress indeterminate></md-linear-progress>`
            : nothing}
          ${this.AIConfigReview ? this.renderAIConfigReview() : nothing}
        </div>
      </div>
    `;
  }

  /*findNodeRecursively = (
    nodes: LtpCurrentRealityAgentDataNode[],
    nodeId: string
  ): LtpCurrentRealityAgentDataNode | undefined => {
    for (const node of nodes) {
      if (node.id === nodeId) {
        return node;
      }
      if (node.children) {
        const foundNode = this.findNodeRecursively(node.children, nodeId);
        if (foundNode) {
          return foundNode;
        }
      }
    }
    return undefined;
  };*/

  openAddCauseDialog(event: CustomEvent) {
    console.error(`openAddCauseDialog ${event.detail.parentNodeId}`);
    const parentNodeId = event.detail.parentNodeId;
    // Get the node from the tree recursively

    // Find the node recursively
    /* const node = this.findNodeRecursively(this.currentAgent?.nodes || [], parentNodeId);
    if (!node) {
      console.error(`Could not find node ${parentNodeId}`);
      console.error(JSON.stringify(this.currentAgent, null, 2));
      return;
    }
    this.nodeToAddCauseTo = node;
    (this.$$("#addCauseDialog") as MdDialog).show();*/
  }

  closeAddCauseDialog() {
    (this.$$('#addCauseDialog') as MdDialog).close();
    this.nodeToAddCauseTo = undefined;
  }

  renderAddCauseDialog() {
    return html`
      <md-dialog
        id="addCauseDialog"
        style="max-width: 800px;max-height: 90vh;"
        @closed="${this.closeAddCauseDialog}"
      >
        <div slot="headline">${/*this.nodeToAddCauseTo?.description*/ ''}</div>
        <div slot="content" class="chatContainer">
          ${this.nodeToAddCauseTo
            ? html`
                <ltp-chat-assistant
                  .nodeToAddCauseTo="${this.nodeToAddCauseTo}"
                  method="dialog"
                  .textInputLabel="${this.t(
                    'Enter sufficent direct causes to the effect'
                  )}"
                  .agentData="${this.currentAgent}"
                  @close="${this.closeAddCauseDialog}"
                >
                </ltp-chat-assistant>
              `
            : nothing}
        </div>
      </md-dialog>
    `;
  }

  render(): any {
    if (this.isFetchingAgent) {
      return html`<md-linear-progress indeterminate></md-linear-progress>`;
    } else {
      return cache(html`
        ${this.renderAddCauseDialog()} ${this.renderEditNodeDialog()}
        ${this.renderDeleteConfirmationDialog()}
        <md-tabs id="tabBar" @change="${this.tabChanged}">
          <md-primary-tab id="configure-tab" aria-controls="configure-panel">
            <md-icon slot="icon">support_agent</md-icon>
            ${this.t('Agents Operations')}
          </md-primary-tab>
          <md-primary-tab id="crt-tab" aria-controls="crt-panel" +>
            <md-icon slot="icon">checklist</md-icon>
            ${this.t('Audit Log')}
          </md-primary-tab>
          <md-primary-tab id="crt-tab" aria-controls="crt-panel" +>
            <md-icon slot="icon">account_balance</md-icon>
            ${this.t('Costs')}
          </md-primary-tab>
        </md-tabs>
        <ps-operations-view
          .currentAgent="${this.currentAgent}"
        ></ps-operations-view>
      `);
    }
  }
}
