import { PsRagChunkVectorStore } from "../ragChunk.js";
async function run() {
    const store = new PsRagChunkVectorStore();
    await store.deleteScheme();
    process.exit(0);
}
run();
