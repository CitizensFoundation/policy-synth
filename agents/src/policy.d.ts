interface PSImplentingEntity extends PsAffectedEntity {}

interface PSDependentEntity extends PsAffectedEntity {}

interface PSMemoryData extends PsSmarterCrowdsourcingMemoryData {}

interface PSPolicyFeedback {
  source: "AI" | "Policymaker" | "Citizen";
  feedback: string;
  timestamp: Date;
}

interface PSPolicyReference {
  title: string;
  source: string;
  link?: URL;
}

interface PSEvidenceWebPageGraphQlResults {
  data: {
    Get: {
      EvidenceWebPage: PSEvidenceRawWebPageData[];
    };
  };
}

interface PSPolicyRating {
  evidenceRelevanceToPolicyProposalScore: number;
  evidenceRelevanceToEvidenceTypeScore: number;
  evidenceConfidenceScore: number;
  evidenceQualityScore: number;
}

type PSEvidenceWebPageTypes =
  | "positiveEvidence"
  | "negativeEvidence"
  | "neutralEvidence"
  | "economicEvidence"
  | "scientificEvidence"
  | "culturalEvidence"
  | "environmentalEvidence"
  | "legalEvidence"
  | "technologicalEvidence"
  | "geopoliticalEvidence"

  | "caseStudies"

  | "stakeholderOpinions"
  | "expertOpinions"
  | "publicOpinions"

  | "historicalContext"
  | "ethicalConsiderations"

  | "longTermImpact"
  | "shortTermImpact"

  | "localPerspective"
  | "globalPerspective"

  | "costAnalysis"
  | "implementationFeasibility";

type PSEvidenceSearchResults = {
  [K in PSEvidenceWebPageTypes]: SearchResultItem;
};

type PSEvidenceSearchQueries = {
  [K in PSEvidenceWebPageTypes]: string[];
};

interface PSPolicyStage {
  description: string;
  eloRating?: number;
  actions?: PSPolicyAction[];
}

interface PSPolicyAction {
  description: string;
  eloRating?: number;
  implementingEntities: PSImplentingEntity[];
  dependentOnEntities: PSDependentEntity[];
  evidenceSearchQueries?: PsSearchQueries;
  evidenceSearchResults?: PSEvidenceSearchResults;
}

interface PSEvidenceRawWebPageData {
  mostRelevantParagraphs: string[];
  allPossiblePositiveEvidenceIdentifiedInTextContext?: string[];
  allPossibleNegativeEvidenceIdentifiedInTextContext?: string[];
  allPossibleNeutralEvidenceIdentifiedInTextContext?: string[];
  allPossibleEconomicEvidenceIdentifiedInTextContext?: string[];
  allPossibleScientificEvidenceIdentifiedInTextContext?: string[];
  allPossibleCulturalEvidenceIdentifiedInTextContext?: string[];
  allPossibleEnvironmentalEvidenceIdentifiedInTextContext?: string[];
  allPossibleLegalEvidenceIdentifiedInTextContext?: string[];
  allPossibleTechnologicalEvidenceIdentifiedInTextContext?: string[];
  allPossibleGeopoliticalEvidenceIdentifiedInTextContext?: string[];

  allPossibleCaseStudiesIdentifiedInTextContext?: string[];
  allPossibleStakeholderOpinionsIdentifiedInTextContext?: string[];
  allPossibleExpertOpinionsIdentifiedInTextContext?: string[];
  allPossiblePublicOpinionsIdentifiedInTextContext?: string[];

  allPossibleHistoricalContextIdentifiedInTextContext?: string[];
  allPossibleEthicalConsiderationsIdentifiedInTextContext?: string[];

  allPossibleLongTermImpactIdentifiedInTextContext?: string[];
  allPossibleShortTermImpactIdentifiedInTextContext?: string[];

  allPossibleLocalPerspectiveIdentifiedInTextContext?: string[];
  allPossibleGlobalPerspectiveIdentifiedInTextContext?: string[];

  allPossibleCostAnalysisIdentifiedInTextContext?: string[];
  allPossibleImplementationFeasibilityIdentifiedInTextContext?: string[];
  hasBeenRefined?: boolean;
  relevanceToPolicyProposal: string;
  policyTitle?: string;
  confidenceScore?: number;
  relevanceToTypeScore?: number;
  totalScore?: number;
  relevanceScore?: number;
  qualityScore?: number;
  tags?: string[];
  entities?: string[];
  contacts?: string[];
  summary: string;
  url: string;
  searchType: PSEvidenceWebPageTypes;
  subProblemIndex?: number;
  entityIndex?: number;
  groupId: number;
  communityId: number;
  domainId: number;

  whatPolicyNeedsToImplementInResponseToEvidence?: string[];
  mostImportantPolicyEvidenceInTextContext?: string[];
  evidenceAcademicSources?: string[];
  evidenceOrganizationSources?: string[];
  evidenceHumanSources?: string[];
  prosForPolicyFoundInTextContext?: string[];
  consForPolicyFoundInTextContext?: string[];
  risksForPolicy?: string[];

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

interface PSEvidenceWebPageAnalysisData {
  rawWebPageDataId: string;
  implicationsForPolicy: string[];
  relevanceToPolicy: string;
  biasesOrLimitations: string[];
}

interface PSRefinedPolicyEvidence {
  summary: string;
  mostRelevantParagraphs: string[];
  relevanceToPolicyProposal: string;

  mostImportantPolicyEvidenceInTextContext: string[];
  prosForPolicyFoundInTextContext: string[];
  consForPolicyFoundInTextContext: string[];
  whatPolicyNeedsToImplementInResponseToEvidence: string[];
  risksForPolicy: string[];
  evidenceAcademicSources: string[];
  evidenceOrganizationSources: string[];
  evidenceHumanSources: string[];
  hasBeenRefined: boolean;

  confidenceScore: number;
  relevanceToTypeScore: number;
  relevanceScore: number;
  qualityScore: number;
  totalScore?: number;
}

interface PSWebPageMetadata {
  metaTitle: string;
  metaDescription: string;
  metaPublisher: string;
  metaImageUrl: string;
  metaLogoUrl: string;
  metaAuthor: string;
  metaDate: string;
}

interface PSPolicyRisk {
  riskDescription: string;
  likelihood: "High" | "Medium" | "Low";
  impact: "High" | "Medium" | "Low";
  mitigationStrategies: string[];
}

interface PSCulturalSocialImpact {
  potentialImpact: string;
  affectedGroups: string[]; // e.g., 'Minorities', 'Rural Communities'
  recommendations: string[];
}

interface PSEconomicImpact {
  projectedEconomicBenefit: number;
  potentialCosts: number;
  ROI: number;
}

interface PSEconomicImpactQualitative {
  potentialEconomicBenefits: string[]; // e.g., ['Job creation in rural areas', 'Boost in local manufacturing']
  potentialEconomicConcerns: string[]; // e.g., ['Potential job loss in sector X', 'Inflationary concerns']
  recommendedEconomicStudies: string[]; // e.g., ['Study on job creation in rural areas', 'Research on impact on small businesses']
}

interface PSLegalConsideration {
  legalConstraint: string;
  implications: string;
}

interface PSEnvironmentalConsideration {
  potentialEnvironmentalImpact: string;
  sustainabilityRecommendations: string[];
}

interface PSTechnologicalDependency {
  technologyName: string;
  roleInPolicy: string; // e.g., 'Monitoring', 'Implementation'
  reliability: "High" | "Medium" | "Low";
}

interface PSPolicy {
  subProblemIndex: number;
  solutionIndex: string;
  title: string;
  description: string;
  fullDescription?: string;
  conditionsForSuccess: string[];
  mainObstaclesForImplemention: string[];
  mainRisks: string[];
  policyKPIMetrics: string[];
  whyTheBestChoice?: string;
  imagePrompt?: string;
  imageUrl?: string;
  eloRating?: number;
  reaped?: boolean;
  similarityGroup?: PsSimilarityGroup;
  isFirstInGroup?: boolean;
  implementingEntities: PSImplentingEntity[];
  dependentOnEntities: PSDependentEntity[];
  evidenceSearchQueries?: PSEvidenceSearchQueries;
  evidenceSearchResults?: PSEvidenceSearchResults;
  stages?: PSPolicyStage[];
  environmentConsiderations?: PSEnvironmentalConsideration[];
  culturalSocialImpacts?: PSCulturalSocialImpact[];
  economicImpactsQualitative?: PSEconomicImpactQualitative[];
  legalConsiderations?: PSLegalConsideration[];
  technologicalDependencies?: PSTechnologicalDependency[];
  ratings?: object;
  family?: {
    parentA?: string; // "<generationIndex>:<solutionId>"
    parentB?: string;
    mutationRate?: PsMutationRates;
    gen?: number;
  };
  vectorStoreId?: string;
}
