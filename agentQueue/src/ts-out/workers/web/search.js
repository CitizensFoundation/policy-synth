import { Worker } from "bullmq";
import { BaseWorker } from "../baseWorker.js";
class WorkerWebSearch extends BaseWorker {
    async process(job) { }
}
const worker = new Worker("worker-web-search", async (job) => {
    const getPage = new WorkerWebSearch();
    await getPage.process(job);
    return job.data;
}, { concurrency: parseInt(process.env.WORKER_WEB_SEARCH_CONCURRENCY || "1") });
process.on("SIGINT", async () => {
    await worker.close();
});
