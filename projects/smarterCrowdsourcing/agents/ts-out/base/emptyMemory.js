export function emptySmarterCrowdsourcingMemory(groupId, agentId) {
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
    };
}
//# sourceMappingURL=emptyMemory.js.map