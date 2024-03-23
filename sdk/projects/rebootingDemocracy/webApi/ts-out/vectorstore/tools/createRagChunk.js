import { PsRagChunkVectorStore } from "../ragChunk.js";
async function run() {
    const store = new PsRagChunkVectorStore();
    await store.addSchema();
    process.exit(0);
}
run();
//# sourceMappingURL=createRagChunk.js.map