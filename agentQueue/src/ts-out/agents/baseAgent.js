import ioredis from "ioredis";
import { Base } from "../base.js";
const redis = new ioredis.default(process.env.REDIS_MEMORY_URL || "redis://localhost:6379");
export class BaseAgent extends Base {
    memory;
    job;
    getRedisKey(groupId) {
        return `st_mem:${groupId}:id`;
    }
    async setup(job) {
        this.job = job;
        const jobData = job.data;
        try {
            const memoryData = (await redis.get(this.getRedisKey(jobData.groupId)));
            if (memoryData) {
                this.memory = JSON.parse(memoryData);
            }
            else {
                console.error("No project data found, user createNewCustomProject script in tools");
                //await this.initializeMemory(job);
                //this.logger.debug(`Initialized memory for ${JSON.stringify(jobData)}`);
            }
        }
        catch (error) {
            this.logger.error("Error initializing memory");
            this.logger.error(error);
        }
    }
    defaultStages = {
        "create-root-causes-search-queries": {},
        "web-search-root-causes": {},
        "web-get-root-causes-pages": {},
        "rank-web-root-causes": {},
        "rate-web-root-causes": {},
        "web-get-refined-root-causes": {},
        "get-metadata-for-top-root-causes": {},
        "create-sub-problems": {},
        "rank-sub-problems": {},
        "create-entities": {},
        "rank-entities": {},
        "create-search-queries": {},
        "create-sub-problem-images": {},
        "rank-search-queries": {},
        "web-search": {},
        "rate-solutions": {},
        "rank-search-results": {},
        "rank-web-solutions": {},
        "web-get-pages": {},
        "create-seed-solutions": {},
        "create-pros-cons": {},
        "create-solution-images": {},
        "create-problem-statement-image": {},
        "rank-pros-cons": {},
        "rank-solutions": {},
        "group-solutions": {},
        "evolve-create-population": {},
        "evolve-mutate-population": {},
        "evolve-recombine-population": {},
        "evolve-reap-population": {},
        "topic-map-solutions": {},
        "evolve-rank-population": {},
        "analyse-external-solutions": {},
        "policies-seed": {},
        "policies-create-images": {},
        "create-evidence-search-queries": {},
        "web-get-evidence-pages": {},
        "web-search-evidence": {},
        "rank-web-evidence": {},
        "rate-web-evidence": {},
        "web-get-refined-evidence": {},
        "get-metadata-for-top-evidence": {}
    };
    async saveMemory() {
        this.memory.lastSavedAt = Date.now();
        await redis.set(this.memory.redisKey, JSON.stringify(this.memory));
    }
}
