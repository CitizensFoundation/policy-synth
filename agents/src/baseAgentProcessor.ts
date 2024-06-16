import { Job } from "bullmq";
import ioredis from "ioredis";
import { PolicySynthAgentBase } from "./baseAgent.js";

const redis = new ioredis(process.env.REDIS_MEMORY_URL || "redis://localhost:6379");

export abstract class BaseAgentProcessor extends PolicySynthAgentBase {
  job!: Job;

  getRedisKey(groupId: number) {
    return `st_mem:${groupId}:id`;
  }

  async initializeMemory(job: Job) {
    const jobData = job.data as PsWorkerData;

    this.memory = {
      redisKey: this.getRedisKey(jobData.groupId),
      groupId: jobData.groupId,
      communityId: jobData.communityId,
      domainId: jobData.domainId,
      currentStage: "create-sub-problems",
      stages: PolicySynthAgentBase.emptyDefaultStages,
      timeStart: Date.now(),
      totalCost: 0,
      customInstructions: {},
      problemStatement: {
        description: jobData.initialProblemStatement,
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
      subProblems: [],
      currentStageData: undefined,
    } as PsBaseMemoryData;
    await this.saveMemory();
  }

  abstract process(): Promise<void>;

  async setup(job: Job) {
    this.job = job;
    const jobData = job.data as PsWorkerData;
    try {
      const memoryData =
        (await redis.get(this.getRedisKey(jobData.groupId)));
      if (memoryData) {
        this.memory = JSON.parse(memoryData);
      } else {
        console.error("No project data found, user createNewCustomProject script in tools")
        //await this.initializeMemory(job);
        //this.logger.debug(`Initialized memory for ${JSON.stringify(jobData)}`);
      }
    } catch (error) {
      this.logger.error("Error initializing memory");
      this.logger.error(error);
    }
  }

  async saveMemory() {
    if (this.memory) {
      this.memory.lastSavedAt = Date.now();
      await redis.set(this.memory.redisKey, JSON.stringify(this.memory));
    } else {
      this.logger.error("No memory to save");
    }
  }
}
