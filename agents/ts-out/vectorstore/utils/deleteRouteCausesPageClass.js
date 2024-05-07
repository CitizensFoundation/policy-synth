import { RootCauseWebPageVectorStore } from "../rootCauseWebPage.js";
async function run() {
    const store = new RootCauseWebPageVectorStore();
    await store.deleteScheme();
    process.exit(0);
}
run();
//# sourceMappingURL=deleteRouteCausesPageClass.js.map