import { WebPageVectorStore } from "../webPage.js";

async function run() {
    const store = new WebPageVectorStore();
    await store.deleteScheme();
}

run();
