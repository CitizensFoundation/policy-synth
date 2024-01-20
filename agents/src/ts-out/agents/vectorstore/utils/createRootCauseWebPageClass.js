import { RootCauseWebPageVectorStore } from "../rootCauseWebPage.js";
async function run() {
    const store = new RootCauseWebPageVectorStore();
    await store.addSchema();
}
run();
