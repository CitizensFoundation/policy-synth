import { PsEcasYeaRagChunkVectorStore } from "../ragChunk.js";
async function run() {
    const store = new PsEcasYeaRagChunkVectorStore();
    await store.addSchema();
    process.exit(0);
}
run();
//# sourceMappingURL=createRagChunk.js.map