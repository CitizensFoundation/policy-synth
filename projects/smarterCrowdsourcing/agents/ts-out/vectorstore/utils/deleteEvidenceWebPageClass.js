import { EvidenceWebPageVectorStore } from "../evidenceWebPage.js";
async function run() {
    const store = new EvidenceWebPageVectorStore();
    await store.deleteScheme();
}
run();
//# sourceMappingURL=deleteEvidenceWebPageClass.js.map