import { PsEcasYeaRagChunkVectorStore } from "../ragChunk.js";
async function run() {
    //@ts-ignore
    const store = new PsEcasYeaRagChunkVectorStore(undefined, undefined, 0, 100);
    await store.addSchema();
    process.exit(0);
}

run();
