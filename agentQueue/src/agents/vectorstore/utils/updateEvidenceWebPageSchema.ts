import { EvidenceWebPageVectorStore } from "../evidenceWebPage.js";

async function updateEvidenceWebPageSchema() {
  const propWhatToInclude = {
    dataType: ["text[]"],
    moduleConfig: {
      "text2vec-openai": {
        skip: false,
        vectorizePropertyName: true,
      },
    },
    name: "whatPolicyNeedsToImplementInResponseToEvidence",
  };

  const propMostImportantEvidence = {
    dataType: ["text[]"],
    moduleConfig: {
      "text2vec-openai": {
        skip: false,
        vectorizePropertyName: true,
      },
    },
    name: "mostImportantPolicyEvidenceInTextContext",
  };

  const propSourcesAc = {
    dataType: ["text[]"],
    moduleConfig: {
      "text2vec-openai": {
        skip: false,
        vectorizePropertyName: true,
      },
    },
    name: "evidenceAcademicSources",
  };

  const propSourcesOr = {
    dataType: ["text[]"],
    moduleConfig: {
      "text2vec-openai": {
        skip: false,
        vectorizePropertyName: true,
      },
    },
    name: "evidenceOrganizationSources",
  };

  const propSourcesHU = {
    dataType: ["text[]"],
    moduleConfig: {
      "text2vec-openai": {
        skip: false,
        vectorizePropertyName: true,
      },
    },
    name: "evidenceHumanSources",
  };

  const propSourcesPros = {
    dataType: ["text[]"],
    moduleConfig: {
      "text2vec-openai": {
        skip: false,
        vectorizePropertyName: true,
      },
    },
    name: "prosForPolicyFoundInTextContext",
  };

  const propSourcesCons = {
    dataType: ["text[]"],
    moduleConfig: {
      "text2vec-openai": {
        skip: false,
        vectorizePropertyName: true,
      },
    },
    name: "consForPolicyFoundInTextContext",
  };

  const propSourcesRisk = {
    dataType: ["text[]"],
    moduleConfig: {
      "text2vec-openai": {
        skip: false,
        vectorizePropertyName: true,
      },
    },
    name: "risksForPolicy",
  };

  const hasBeenRefined = {
    dataType: ["boolean"],
    moduleConfig: {
      "text2vec-openai": {
        skip: false,
        vectorizePropertyName: true,
      },
    },

    name: "hasBeenRefined",
  };

  let resultProp = await EvidenceWebPageVectorStore.client.schema
    .propertyCreator()
    .withClassName("EvidenceWebPage")
    .withProperty(hasBeenRefined)
    .do();

  resultProp = await EvidenceWebPageVectorStore.client.schema
    .propertyCreator()
    .withClassName("EvidenceWebPage")
    .withProperty(propWhatToInclude)
    .do();

  resultProp = await EvidenceWebPageVectorStore.client.schema
    .propertyCreator()
    .withClassName("EvidenceWebPage")
    .withProperty(propMostImportantEvidence)
    .do();

  resultProp = await EvidenceWebPageVectorStore.client.schema
    .propertyCreator()
    .withClassName("EvidenceWebPage")
    .withProperty(propSourcesAc)
    .do();

  resultProp = await EvidenceWebPageVectorStore.client.schema
    .propertyCreator()
    .withClassName("EvidenceWebPage")
    .withProperty(propSourcesOr)
    .do();

  resultProp = await EvidenceWebPageVectorStore.client.schema
    .propertyCreator()
    .withClassName("EvidenceWebPage")
    .withProperty(propSourcesHU)
    .do();

  resultProp = await EvidenceWebPageVectorStore.client.schema
    .propertyCreator()
    .withClassName("EvidenceWebPage")
    .withProperty(propSourcesPros)
    .do();

  resultProp = await EvidenceWebPageVectorStore.client.schema
    .propertyCreator()
    .withClassName("EvidenceWebPage")
    .withProperty(propSourcesCons)
    .do();

  resultProp = await EvidenceWebPageVectorStore.client.schema
    .propertyCreator()
    .withClassName("EvidenceWebPage")
    .withProperty(propSourcesRisk)
    .do();


  console.log(resultProp);
}

updateEvidenceWebPageSchema();
