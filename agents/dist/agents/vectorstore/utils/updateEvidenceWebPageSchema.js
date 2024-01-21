import { EvidenceWebPageVectorStore } from "../evidenceWebPage.js";
async function updateEvidenceWebPageSchema() {
    const metaAuthor = {
        dataType: ["string"],
        moduleConfig: {
            "text2vec-openai": {
                skip: false,
                vectorizePropertyName: true,
            },
        },
        name: "metaAuthor",
    };
    const metaDate = {
        dataType: ["string"],
        moduleConfig: {
            "text2vec-openai": {
                skip: false,
                vectorizePropertyName: true,
            },
        },
        name: "metaDate",
    };
    const metaImageUrl = {
        dataType: ["string"],
        moduleConfig: {
            "text2vec-openai": {
                skip: false,
                vectorizePropertyName: true,
            },
        },
        name: "metaImageUrl",
    };
    const metaLogoUrl = {
        dataType: ["string"],
        moduleConfig: {
            "text2vec-openai": {
                skip: false,
                vectorizePropertyName: true,
            },
        },
        name: "metaLogoUrl",
    };
    const metaTitle = {
        dataType: ["string"],
        moduleConfig: {
            "text2vec-openai": {
                skip: false,
                vectorizePropertyName: true,
            },
        },
        name: "metaTitle",
    };
    const metaDescription = {
        dataType: ["text"],
        moduleConfig: {
            "text2vec-openai": {
                skip: false,
                vectorizePropertyName: true,
            },
        },
        name: "metaDescription",
    };
    const metaPublisher = {
        dataType: ["string"],
        moduleConfig: {
            "text2vec-openai": {
                skip: false,
                vectorizePropertyName: true,
            },
        },
        name: "metaPublisher",
    };
    let resultProp = await EvidenceWebPageVectorStore.client.schema
        .propertyCreator()
        .withClassName("EvidenceWebPage")
        .withProperty(metaAuthor)
        .do();
    resultProp = await EvidenceWebPageVectorStore.client.schema
        .propertyCreator()
        .withClassName("EvidenceWebPage")
        .withProperty(metaDate)
        .do();
    resultProp = await EvidenceWebPageVectorStore.client.schema
        .propertyCreator()
        .withClassName("EvidenceWebPage")
        .withProperty(metaTitle)
        .do();
    resultProp = await EvidenceWebPageVectorStore.client.schema
        .propertyCreator()
        .withClassName("EvidenceWebPage")
        .withProperty(metaDescription)
        .do();
    resultProp = await EvidenceWebPageVectorStore.client.schema
        .propertyCreator()
        .withClassName("EvidenceWebPage")
        .withProperty(metaPublisher)
        .do();
    resultProp = await EvidenceWebPageVectorStore.client.schema
        .propertyCreator()
        .withClassName("EvidenceWebPage")
        .withProperty(metaImageUrl)
        .do();
    resultProp = await EvidenceWebPageVectorStore.client.schema
        .propertyCreator()
        .withClassName("EvidenceWebPage")
        .withProperty(metaLogoUrl)
        .do();
    console.log(resultProp);
}
updateEvidenceWebPageSchema();
//# sourceMappingURL=updateEvidenceWebPageSchema.js.map