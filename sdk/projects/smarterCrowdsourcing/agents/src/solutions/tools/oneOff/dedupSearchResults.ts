import ioredis from "ioredis";

const redis = new ioredis(
  process.env.REDIS_AGENT_URL || "redis://localhost:6379"
);

class DeduplicateSearchAgent {
  memory: PsSmarterCrowdsourcingMemoryData;
  deduplicatedCount: number;
  totalCount: number;
  seenUrls: Map<string, Set<string>>;

  constructor(memory: PsSmarterCrowdsourcingMemoryData) {
    this.memory = memory;
    this.deduplicatedCount = 0;
    this.totalCount = 0;
    this.seenUrls = new Map();
  }

  deduplicateArrayByProperty(
    arr: Array<PsSearchResultItem>,
    prop: string,
    id: string
  ): Array<PsSearchResultItem> {
    this.totalCount += arr.length;
    if (!this.seenUrls.has(id)) {
      this.seenUrls.set(id, new Set());
    }
    const seen = this.seenUrls.get(id);
    const deduplicatedArray = arr.filter((item) => {
      //@ts-ignore
      const value = item[prop];
      if (seen!.has(value)) {
        return false;
      }
      seen!.add(value);
      return true;
    });
    this.deduplicatedCount += deduplicatedArray.length;
    return deduplicatedArray;
  }

  maxSubProblems = 10;

  deduplicateSubProblems(searchQueryType: PsWebPageTypes) {
    const subProblemsCount = Math.min(
      this.memory.subProblems.length,
      this.maxSubProblems
    );
    for (let s = 0; s < subProblemsCount; s++) {
      if (this.memory.subProblems[s].searchResults) {
        const previousCount =
          this.memory.subProblems[s].searchResults.pages[searchQueryType]
            .length;
        this.memory.subProblems[s].searchResults.pages[searchQueryType] =
          this.deduplicateArrayByProperty(
            this.memory.subProblems[s].searchResults.pages[searchQueryType],
            "title",
            `subProblem_${s}`
          );
        const newCount =
          this.memory.subProblems[s].searchResults.pages[searchQueryType]
            .length;
        if (previousCount !== newCount) {
          console.log(
            `SubProblem ${s} ${searchQueryType} deduplicated count: ${newCount}`
          );
        }
      }
      this.deduplicateEntities(s, searchQueryType);
    }
  }

  maxTopEntitiesToSearch = 3;

  deduplicateEntities(
    subProblemIndex: number,
    searchQueryType: PsWebPageTypes
  ) {
    const subProblem: PsSubProblem =
      this.memory.subProblems[subProblemIndex];
    const entitiesCount = Math.min(
      subProblem.entities.length,
      this.maxTopEntitiesToSearch
    );
    for (let e = 0; e < entitiesCount; e++) {
      if (subProblem.entities[e].searchResults) {
        const previousCount =
          subProblem.entities[e].searchResults!.pages[searchQueryType].length;
        subProblem.entities[e].searchResults!.pages[searchQueryType] =
          this.deduplicateArrayByProperty(
            subProblem.entities[e].searchResults!.pages[searchQueryType],
            "title",
            `entity_${subProblemIndex}_${e}`
          );
        const newCount =
          subProblem.entities[e].searchResults!.pages[searchQueryType].length;
        if (previousCount !== newCount) {
          console.log(
            `SubProblem ${subProblemIndex} Entity ${e} ${searchQueryType} deduplicated count: ${newCount}`
          );
        }
      }
    }
  }

  deduplicateProblemStatement(searchQueryType: PsWebPageTypes) {
    const previousCount =
      this.memory.problemStatement.searchResults.pages[searchQueryType].length;
    this.memory.problemStatement.searchResults.pages[searchQueryType] =
      this.deduplicateArrayByProperty(
        this.memory.problemStatement.searchResults.pages[searchQueryType],
        "title",
        "problemStatement"
      );
    const newCount =
      this.memory.problemStatement.searchResults.pages[searchQueryType].length;
    if (previousCount !== newCount) {
      console.log(
        `ProblemStatement ${searchQueryType} deduplicated count: ${newCount}`
      );
    }
  }

  process() {
    try {
      const searchQueryTypes: PsWebPageTypes[] = [
        "general",
        "scientific",
        "openData",
        "news",
      ];
      for (const searchQueryType of searchQueryTypes) {
        this.deduplicateProblemStatement(searchQueryType);
        this.deduplicateSubProblems(searchQueryType);
      }
      console.log(`Total deduplicated count: ${this.deduplicatedCount}`);
      console.log(`Total count before deduplication: ${this.totalCount}`);
      console.log(`Total deduped: ${this.totalCount - this.deduplicatedCount}`);
    } catch (error) {
      console.error("Error processing deduplication");
      console.error(error);
      throw error;
    }
  }
}
const projectId = process.argv[2];

const dedup = async (): Promise<void> => {
  if (projectId) {
    const output = await redis.get(`st_mem:${projectId}:id`);
    const memory = JSON.parse(output!) as PsSmarterCrowdsourcingMemoryData;

    const dedupper = new DeduplicateSearchAgent(memory);
    dedupper.process();

    await redis.set(`st_mem:${projectId}:id`, JSON.stringify(memory));
    process.exit(0);
  } else {
    console.log("No project id provided - deduplicate search results");
    process.exit(1);
  }
};

dedup().catch((error) => {
  console.error(error);
  process.exit(1);
});
