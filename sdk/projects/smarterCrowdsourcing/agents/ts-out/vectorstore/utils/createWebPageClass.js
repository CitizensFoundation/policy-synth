import { WebPageVectorStore } from "../webPage.js";
async function run() {
    const store = new WebPageVectorStore();
    await store.addSchema();
    process.exit(0);
}
run();
//# sourceMappingURL=createWebPageClass.js.map