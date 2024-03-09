import { PsRagDocumentVectorStore } from "../ragDocument.js";
async function run() {
    const store = new PsRagDocumentVectorStore();
    await store.addSchema();
}
run();
