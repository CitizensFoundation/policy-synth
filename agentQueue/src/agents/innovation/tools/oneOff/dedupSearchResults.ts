import ioredis from 'ioredis';
import fs from 'fs/promises';

const redis = new ioredis.default(
  process.env.REDIS_MEMORY_URL || 'redis://localhost:6379'
);

class DeduplicateSearchProcessor {
  memory: IEngineInnovationMemoryData;
  deduplicatedCount: number;
  totalCount: number;

  constructor(memory: IEngineInnovationMemoryData) {
    this.memory = memory;
    this.deduplicatedCount = 0;
    this.totalCount = 0;
  }

  deduplicateArrayByProperty(arr: Array<IEngineSearchResultItem>, prop: string): Array<IEngineSearchResultItem> {
    this.totalCount += arr.length;
    const seen = new Set();
    const deduplicatedArray = arr.filter(item => {
      //@ts-ignore
      const value = item[prop];
      if (seen.has(value)) {
        return false;
      }
      seen.add(value);
      return true;
    });
    this.deduplicatedCount += deduplicatedArray.length;
    return deduplicatedArray;
  }

  deduplicateSubProblems(searchQueryType: IEngineWebPageTypes) {
    for (let s = 0; s < this.memory.subProblems.length; s++) {
      const previousCount = this.memory.subProblems[s].searchResults.pages[searchQueryType].length;
      this.memory.subProblems[s].searchResults.pages[searchQueryType] =
        this.deduplicateArrayByProperty(this.memory.subProblems[s].searchResults.pages[searchQueryType], 'title');
      const newCount = this.memory.subProblems[s].searchResults.pages[searchQueryType].length;
      if (previousCount !== newCount) {
        console.log(`SubProblem ${s} ${searchQueryType} deduplicated count: ${newCount}`);
      }
      this.deduplicateEntities(s, searchQueryType);
    }
  }

  deduplicateEntities(subProblemIndex: number, searchQueryType: IEngineWebPageTypes) {
    const subProblem: IEngineSubProblem = this.memory.subProblems[subProblemIndex];
    for (let e = 0; e < subProblem.entities.length; e++) {
      const previousCount = subProblem.entities[e].searchResults!.pages[searchQueryType].length;
      subProblem.entities[e].searchResults!.pages[searchQueryType] =
        this.deduplicateArrayByProperty(subProblem.entities[e].searchResults!.pages[searchQueryType], 'title');
      const newCount = subProblem.entities[e].searchResults!.pages[searchQueryType].length;
      if (previousCount !== newCount) {
        console.log(`SubProblem ${subProblemIndex} Entity ${e} ${searchQueryType} deduplicated count: ${newCount}`);
      }
    }
  }

  deduplicateProblemStatement(searchQueryType: IEngineWebPageTypes) {
    const previousCount = this.memory.problemStatement.searchResults.pages[searchQueryType].length;
    this.memory.problemStatement.searchResults.pages[searchQueryType] =
      this.deduplicateArrayByProperty(this.memory.problemStatement.searchResults.pages[searchQueryType], 'title');
    const newCount = this.memory.problemStatement.searchResults.pages[searchQueryType].length;
    if (previousCount !== newCount) {
      console.log(`ProblemStatement ${searchQueryType} deduplicated count: ${newCount}`);
    }
  }

  process() {
    try {
      const searchQueryTypes: IEngineWebPageTypes[] = ["general", "scientific", "openData", "news"];
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
    const memory = JSON.parse(output!) as IEngineInnovationMemoryData;

    const dedupper = new DeduplicateSearchProcessor(memory);
    dedupper.process();

    await redis.set(`st_mem:${projectId}:id`, JSON.stringify(memory));
  } else {
    console.log('No project id provided');
    process.exit(1);
  }
}

dedup().catch(console.error);
