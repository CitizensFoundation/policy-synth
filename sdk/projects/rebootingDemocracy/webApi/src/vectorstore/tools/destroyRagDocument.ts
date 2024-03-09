import { PsRagDocumentVectorStore } from "../ragDocument.js";

async function run() {
    const store = new PsRagDocumentVectorStore();
    await store.deleteScheme();
    process.exit(0);
}

run();
