type PSRootCauseWebPageTypes =
  | "historicalRootCause"
  | "economicRootCause"
  | "scientificRootCause"
  | "culturalRootCause"
  | "socialRootCause"
  | "environmentalRootCause"
  | "legalRootCause"
  | "technologicalRootCause"
  | "geopoliticalRootCause"
  | "ethicalRootCause"
  | "caseStudies"
  | "adminSubmitted"

interface PSRootCause {
  rootCauseTitle: string;
  rootCauseDescription: string;
  whyRootCauseIsImportant: string;
  rootCauseDescriptionForPairwiseRanking: string;
  yearPublished?: number;
}

interface PSRefinedRootCause extends PSRootCause {
  rootCauseRelevanceToProblemStatement?: string;
  rootCauseRelevanceToProblemStatementScore?: number;
  rootCauseRelevanceToTypeScore?: number;
  rootCauseRelevanceScore?: number;
  rootCauseQualityScore?: number;
  rootCauseConfidenceScore?: number;
  hasBeenRefined?: boolean;
}

type PSRootCauseSearchResults = {
  [K in PSRootCauseWebPageTypes]: SearchResultItem;
};

type PSRootCauseSearchQueries = {
  [K in PSRootCauseWebPageTypes]: string[];
};

type PSRootCauseAnalysis = {
  [K in PSRootCauseWebPageTypes]: PSRootCause[];
};

interface PSRootCauseRawWebPageData {
  allPossibleHistoricalRootCausesIdentifiedInTextContext?: string[];
  allPossibleEconomicRootCausesIdentifiedInTextContext?: string[];
  allPossibleScientificRootCausesIdentifiedInTextContext?: string[];
  allPossibleCulturalRootCausesIdentifiedInTextContext?: string[];
  allPossibleSocialRootCausesIdentifiedInTextContext?: string[];
  allPossibleEnvironmentalRootCausesIdentifiedInTextContext?: string[];
  allPossibleLegalRootCausesIdentifiedInTextContext?: string[];
  allPossibleTechnologicalRootCausesIdentifiedInTextContext?: string[];
  allPossibleGeopoliticalRootCausesIdentifiedInTextContext?: string[];
  allPossibleEthicalRootCausesIdentifiedInTextContext?: string[];
  allPossibleRootCausesCaseStudiesIdentifiedInTextContext?: string[];

  rootCauseRelevanceToProblemStatement: string;
  rootCauseRelevanceToProblemStatementScore?: number;
  rootCauseRelevanceToTypeScore?: number;
  rootCauseQualityScore?: number;
  rootCauseConfidenceScore?: number;
  totalScore?: number;

  url: string;
  searchType: PSRootCauseWebPageTypes;
  hasBeenRefined?: boolean;
  groupId: number;
  communityId: number;
  domainId: number;

  metaTitle?: string;
  metaDescription?: string;
  metaPublisher?: string;
  metaImageUrl?: string;
  metaLogoUrl?: string;
  metaAuthor?: string;
  metaDate?: string;

  _additional?: {
    distance: number;
    id?: string;
  };
}

interface PSRootCauseRating {
  rootCauseRelevanceToProblemStatementScore: number;
  rootCauseRelevanceToRootCauseTypeScore: number;
  rootCauseQualityScore: number;
  rootCauseConfidenceScore: number;
}

interface PSRootCauseWebPageGraphQlResults {
  data: {
    Get: {
      RootCauseWebPage: PSRootCauseRawWebPageData[];
    };
  };
}
