# Policy Agents API Documentation

- [agentCategories](src/agentCategories.md)
- [aiModelTypes](src/aiModelTypes.md)
- aiModels
  - [azureOpenAiChat](src/aiModels/azureOpenAiChat.md)
  - [baseChatModel](src/aiModels/baseChatModel.md)
  - [claudeChat](src/aiModels/claudeChat.md)
  - [googleGeminiChat](src/aiModels/googleGeminiChat.md)
  - [openAiChat](src/aiModels/openAiChat.md)
- base
  - [agent](src/base/agent.md)
  - [agentBase](src/base/agentBase.md)
  - [agentConfigManager](src/base/agentConfigManager.md)
  - [agentModelManager](src/base/agentModelManager.md)
  - [agentPairwiseRanking](src/base/agentPairwiseRanking.md)
  - [agentProgressTracker](src/base/agentProgressTracker.md)
  - [agentQueue](src/base/agentQueue.md)
  - [agentRateLimiter](src/base/agentRateLimiter.md)
  - [agentRunner](src/base/agentRunner.md)
  - [agentStandalone](src/base/agentStandalone.md)
  - [redisClient](src/base/redisClient.md)
  - [simpleAgent](src/base/simpleAgent.md)
  - [simplePairwiseRanking](src/base/simplePairwiseRanking.md)
- [connectorTypes](src/connectorTypes.md)
- connectors
  - base
    - [baseCollaborationConnector](src/connectors/base/baseCollaborationConnector.md)
    - [baseConnector](src/connectors/base/baseConnector.md)
    - [baseDocumentConnector](src/connectors/base/baseDocumentConnector.md)
    - [baseDriveConnector](src/connectors/base/baseDriveConnector.md)
    - [baseIdeasCollaborationConnector](src/connectors/base/baseIdeasCollaborationConnector.md)
    - [baseNotificationsConnector](src/connectors/base/baseNotificationsConnector.md)
    - [baseSheetConnector](src/connectors/base/baseSheetConnector.md)
    - [baseVotingCollaborationConnector](src/connectors/base/baseVotingCollaborationConnector.md)
    - [connectorFactory](src/connectors/base/connectorFactory.md)
  - collaboration
    - [allOurIdeasConnector](src/connectors/collaboration/allOurIdeasConnector.md)
    - [yourPrioritiesConnector](src/connectors/collaboration/yourPrioritiesConnector.md)
  - documents
    - [googleDocsConnector](src/connectors/documents/googleDocsConnector.md)
  - drive
    - [googleDrive](src/connectors/drive/googleDrive.md)
  - notifications
    - [discordConnector](src/connectors/notifications/discordConnector.md)
  - sheets
    - [googleSheetsConnector](src/connectors/sheets/googleSheetsConnector.md)
- [constants](src/constants.md)
- dbModels
  - [agent](src/dbModels/agent.md)
  - [agentAuditLog](src/dbModels/agentAuditLog.md)
  - [agentClass](src/dbModels/agentClass.md)
  - [agentClassAdmin](src/dbModels/agentClassAdmin.md)
  - [agentClassUser](src/dbModels/agentClassUser.md)
  - [agentConnector](src/dbModels/agentConnector.md)
  - [agentConnectorClass](src/dbModels/agentConnectorClass.md)
  - [agentConnectorClassAdmin](src/dbModels/agentConnectorClassAdmin.md)
  - [agentConnectorClassUser](src/dbModels/agentConnectorClassUser.md)
  - [agentEval](src/dbModels/agentEval.md)
  - [agentInputConnector](src/dbModels/agentInputConnector.md)
  - [agentModel](src/dbModels/agentModel.md)
  - [agentOutputConnector](src/dbModels/agentOutputConnector.md)
  - [agentRegistry](src/dbModels/agentRegistry.md)
  - [agentRegistryAgent](src/dbModels/agentRegistryAgent.md)
  - [agentRegistryConnector](src/dbModels/agentRegistryConnector.md)
  - [aiModel](src/dbModels/aiModel.md)
  - [externalApiUsage](src/dbModels/externalApiUsage.md)
  - [externalApis](src/dbModels/externalApis.md)
  - [modelUsage](src/dbModels/modelUsage.md)
  - [privateAccessStore](src/dbModels/privateAccessStore.md)
  - [sequelize](src/dbModels/sequelize.md)
  - [ypGroup](src/dbModels/ypGroup.md)
  - [ypOrganization](src/dbModels/ypOrganization.md)
  - [ypUser](src/dbModels/ypUser.md)
- deepResearch
  - [fireCrawlApi](src/deepResearch/fireCrawlApi.md)
  - [getWebPagesBase](src/deepResearch/getWebPagesBase.md)
  - [getWebPagesOperations](src/deepResearch/getWebPagesOperations.md)
  - [googleSearchApi](src/deepResearch/googleSearchApi.md)
  - [searchQueriesRanker](src/deepResearch/searchQueriesRanker.md)
  - [webScraper](src/deepResearch/webScraper.md)
- operations
  - [agentConnectorManager](src/operations/agentConnectorManager.md)
  - [agentCostsManager](src/operations/agentCostsManager.md)
  - [agentManager](src/operations/agentManager.md)
  - [agentQueueManager](src/operations/agentQueueManager.md)
  - [agentRegistryManager](src/operations/agentRegistryManager.md)
- [queue](src/queue.md)
- rag
  - ingestion
    - [baseAgent](src/rag/ingestion/baseAgent.md)
    - [chunkAnalyzer](src/rag/ingestion/chunkAnalyzer.md)
    - [chunkCompressorAgent](src/rag/ingestion/chunkCompressorAgent.md)
    - [chunkRanker](src/rag/ingestion/chunkRanker.md)
    - [contentParser](src/rag/ingestion/contentParser.md)
    - [docAnalyzer](src/rag/ingestion/docAnalyzer.md)
    - [docClassifier](src/rag/ingestion/docClassifier.md)
    - [docCleanup](src/rag/ingestion/docCleanup.md)
    - [docRanker](src/rag/ingestion/docRanker.md)
    - [docTreeSplitter](src/rag/ingestion/docTreeSplitter.md)
    - [processor](src/rag/ingestion/processor.md)
  - vectorstore
    - [ragChunk](src/rag/vectorstore/ragChunk.md)
    - [ragDocument](src/rag/vectorstore/ragDocument.md)
    - tools
      - [createRagChunk](src/rag/vectorstore/tools/createRagChunk.md)
      - [createRagDocument](src/rag/vectorstore/tools/createRagDocument.md)
      - [destroyRagChunk](src/rag/vectorstore/tools/destroyRagChunk.md)
      - [destroyRagDocument](src/rag/vectorstore/tools/destroyRagDocument.md)
- tools
  - [addNewAiModel](src/tools/addNewAiModel.md)
  - [addUserToAgentClass](src/tools/addUserToAgentClass.md)
  - [addUserToAllAgentClasses](src/tools/addUserToAllAgentClasses.md)
  - [generateDocumentation](src/tools/generateDocumentation.md)
  - [seedAiModels](src/tools/seedAiModels.md)
  - [seedDbTestClasses](src/tools/seedDbTestClasses.md)
- validations
  - [agentOrchestrator](src/validations/agentOrchestrator.md)
  - [baseValidationAgent](src/validations/baseValidationAgent.md)
  - [classificationAgent](src/validations/classificationAgent.md)
  - [parallelAgent](src/validations/parallelAgent.md)
  - test
    - [testValidationChain](src/validations/test/testValidationChain.md)
- webResearch
  - [bingSearchApi](src/webResearch/bingSearchApi.md)
  - [fireCrawlApi](src/webResearch/fireCrawlApi.md)
  - [getWebPages](src/webResearch/getWebPages.md)
  - [getWebPagesBase](src/webResearch/getWebPagesBase.md)
  - [getWebPagesOperations](src/webResearch/getWebPagesOperations.md)
  - [googleSearchApi](src/webResearch/googleSearchApi.md)
  - [researchWeb](src/webResearch/researchWeb.md)
  - [searchQueriesGenerator](src/webResearch/searchQueriesGenerator.md)
  - [searchQueriesRanker](src/webResearch/searchQueriesRanker.md)
  - [searchResultsRanker](src/webResearch/searchResultsRanker.md)
  - [searchWeb](src/webResearch/searchWeb.md)
  - [searchWebWithAi](src/webResearch/searchWebWithAi.md)
  - [webPageScanner](src/webResearch/webPageScanner.md)
