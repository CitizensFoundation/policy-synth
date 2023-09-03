import { EvidenceWebPageVectorStore } from "../evidenceWebPage.js";
async function updateEvidenceWebPageSchema() {
    const propRel = {
        dataType: ["int"],
        moduleConfig: {
            "text2vec-openai": {
                skip: true,
                vectorizePropertyName: false,
            },
        },
        name: "relevanceToTypeScore"
    };
    const propTotal = {
        dataType: ["int"],
        moduleConfig: {
            "text2vec-openai": {
                skip: true,
                vectorizePropertyName: false,
            },
        },
        name: "totalScore"
    };
    let resultProp = await EvidenceWebPageVectorStore.client.schema
        .propertyCreator()
        .withClassName("EvidenceWebPage")
        .withProperty(propRel)
        .do();
    resultProp = await EvidenceWebPageVectorStore.client.schema
        .propertyCreator()
        .withClassName("EvidenceWebPage")
        .withProperty(propTotal)
        .do();
    console.log(resultProp);
}
updateEvidenceWebPageSchema();
