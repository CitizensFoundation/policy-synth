export function emptySmarterCrowdsourcingMemory(groupId: number, agentId: number) {
  return {
    timeStart: Date.now(),
    agentId,
    groupId,
    problemStatement: {
      searchQueries: {
        general: [],
        scientific: [],
        news: [],
        openData: [],
      },
      searchResults: {
        pages: {
          general: [],
          scientific: [],
          news: [],
          openData: [],
        },
      },
    },
    status: {
      state: "running",
      progress: 0,
      messages: [],
      lastUpdated: Date.now(),
    },
    subProblems: []
  } as PsSmarterCrowdsourcingMemoryData
}
