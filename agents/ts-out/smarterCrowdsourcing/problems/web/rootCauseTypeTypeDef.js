export class RootCauseTypeTypeDefs {
    static render(categoryType) {
        switch (categoryType) {
            case "historicalRootCause":
                return RootCauseTypeTypeDefs.renderHistoricalRootCause();
            case "economicRootCause":
                return RootCauseTypeTypeDefs.renderEconomicRootCause();
            case "scientificRootCause":
                return RootCauseTypeTypeDefs.renderScientificRootCause();
            case "culturalRootCause":
                return RootCauseTypeTypeDefs.renderCulturalRootCause();
            case "socialRootCause":
                return RootCauseTypeTypeDefs.renderSocialRootCause();
            case "environmentalRootCause":
                return RootCauseTypeTypeDefs.renderEnvironmentalRootCause();
            case "legalRootCause":
                return RootCauseTypeTypeDefs.renderLegalRootCause();
            case "technologicalRootCause":
                return RootCauseTypeTypeDefs.renderTechnologicalRootCause();
            case "geopoliticalRootCause":
                return RootCauseTypeTypeDefs.renderGeopoliticalRootCause();
            case "ethicalRootCause":
                return RootCauseTypeTypeDefs.renderEthicalRootCause();
            case "caseStudies":
                return RootCauseTypeTypeDefs.renderCaseStudies();
            default:
                throw new Error("Unknown root cause type");
        }
    }
    static renderHistoricalRootCause() {
        return `
    {
        rootCauseRelevanceToProblemStatement: string,
        allPossibleHistoricalRootCausesIdentifiedInTextContext: string[]
    }
  `;
    }
    static renderEconomicRootCause() {
        return `
    {
      rootCauseRelevanceToProblemStatement: string,
      allPossibleEconomicRootCausesIdentifiedInTextContext: string[]
    }
  `;
    }
    static renderScientificRootCause() {
        return `
    {
        rootCauseRelevanceToProblemStatement: string,
        allPossibleScientificRootCausesIdentifiedInTextContext: string[]
    }
  `;
    }
    static renderCulturalRootCause() {
        return `
    {
      rootCauseRelevanceToProblemStatement: string,
      allPossibleCulturalRootCausesIdentifiedInTextContext: string[]
    }
  `;
    }
    static renderSocialRootCause() {
        return `
  {
    rootCauseRelevanceToProblemStatement: string,
    allPossibleSocialRootCausesIdentifiedInTextContext: string[]
  }
  `;
    }
    static renderEnvironmentalRootCause() {
        return `
    {
      rootCauseRelevanceToProblemStatement: string,
      allPossibleEnvironmentalRootCausesIdentifiedInTextContext: string[]
    }
  `;
    }
    static renderLegalRootCause() {
        return `
    {
      rootCauseRelevanceToProblemStatement": string,
      allPossibleLegalRootCausesIdentifiedInTextContext: string[]
    }
  `;
    }
    static renderTechnologicalRootCause() {
        return `
    {
      rootCauseRelevanceToProblemStatement: string,
      allPossibleTechnologicalRootCausesIdentifiedInTextContext: string[]
    }
  `;
    }
    static renderGeopoliticalRootCause() {
        return `
    {
      rootCauseRelevanceToProblemStatement: string,
      allPossibleGeopoliticalRootCausesIdentifiedInTextContext: string[]
    }
  `;
    }
    static renderEthicalRootCause() {
        return `
    {
      rootCauseRelevanceToProblemStatement: string,
      allPossibleEthicalRootCausesIdentifiedInTextContext: string[]
    }
    `;
    }
    static renderCaseStudies() {
        return `
    {
      rootCauseRelevanceToProblemStatement: string,
      allPossibleRootCausesCaseStudiesIdentifiedInTextContext: string[]
    }
  `;
    }
}
//# sourceMappingURL=rootCauseTypeTypeDef.js.map