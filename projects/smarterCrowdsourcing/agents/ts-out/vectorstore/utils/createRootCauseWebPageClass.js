import { RootCauseWebPageVectorStore } from "../rootCauseWebPage.js";
async function run() {
    const store = new RootCauseWebPageVectorStore();
    await store.addSchema();
    process.exit(0);
}
run();
//# sourceMappingURL=createRootCauseWebPageClass.js.map