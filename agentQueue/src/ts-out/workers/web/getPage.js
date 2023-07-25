import { Worker } from "bullmq";
import { BaseWorker } from "../baseWorker.js";
class WorkerWebGetPage extends BaseWorker {
    async process(job) { }
}
const worker = new Worker("worker-web-get-page", async (job) => {
    const getPage = new WorkerWebGetPage();
    await getPage.process(job);
    return job.data;
}, { concurrency: parseInt(process.env.WORKER_WEB_GET_PAGE_CONCURRENCY || "1") });
process.on("SIGINT", async () => {
    await worker.close();
});
