import { RebootingDemocracyIngestionProcessor } from "./agentProcessor.js";
export class RebootingDemocracyIngestionProcessorWorker extends RebootingDemocracyIngestionProcessor {
}
// Asynchronous main function to run the script
async function main() {
    try {
        const processor = new RebootingDemocracyIngestionProcessor();
        await processor.processDataLayout();
        console.log("Data layout processing completed successfully.");
        process.exit(0);
    }
    catch (error) {
        console.error("Failed to process data layout:", error);
    }
}
// Invoke the main function to start the script
main();
//# sourceMappingURL=ingestContent.js.map