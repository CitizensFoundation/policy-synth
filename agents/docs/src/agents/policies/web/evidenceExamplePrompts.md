# EvidenceExamplePrompts

EvidenceExamplePrompts is a class that provides methods to render different types of evidence related to web pages. It supports a variety of evidence types, such as positive, negative, neutral, economic, scientific, cultural, environmental, legal, technological, geopolitical, case studies, stakeholder opinions, expert opinions, public opinions, historical context, ethical considerations, long-term impact, short-term impact, local perspective, global perspective, cost analysis, and implementation feasibility.

## Methods

| Name       | Parameters                        | Return Type | Description                                                                 |
|------------|-----------------------------------|-------------|-----------------------------------------------------------------------------|
| render     | evidenceType: PSEvidenceWebPageTypes | string      | Renders the specified type of evidence based on the provided evidence type. |

## Examples

```typescript
// Example usage of the EvidenceExamplePrompts class
const evidencePrompts = new EvidenceExamplePrompts();

// Render positive evidence
const positiveEvidence = evidencePrompts.render("positiveEvidence");

// Render negative evidence
const negativeEvidence = evidencePrompts.render("negativeEvidence");

// Render neutral evidence
const neutralEvidence = evidencePrompts.render("neutralEvidence");

// Render economic evidence
const economicEvidence = evidencePrompts.render("economicEvidence");

// Render scientific evidence
const scientificEvidence = evidencePrompts.render("scientificEvidence");

// Render cultural evidence
const culturalEvidence = evidencePrompts.render("culturalEvidence");

// Render environmental evidence
const environmentalEvidence = evidencePrompts.render("environmentalEvidence");

// Render legal evidence
const legalEvidence = evidencePrompts.render("legalEvidence");

// Render technological evidence
const technologicalEvidence = evidencePrompts.render("technologicalEvidence");

// Render geopolitical evidence
const geopoliticalEvidence = evidencePrompts.render("geopoliticalEvidence");

// Render case studies
const caseStudies = evidencePrompts.render("caseStudies");

// Render stakeholder opinions
const stakeholderOpinions = evidencePrompts.render("stakeholderOpinions");

// Render expert opinions
const expertOpinions = evidencePrompts.render("expertOpinions");

// Render public opinions
const publicOpinions = evidencePrompts.render("publicOpinions");

// Render historical context
const historicalContext = evidencePrompts.render("historicalContext");

// Render ethical considerations
const ethicalConsiderations = evidencePrompts.render("ethicalConsiderations");

// Render long-term impact
const longTermImpact = evidencePrompts.render("longTermImpact");

// Render short-term impact
const shortTermImpact = evidencePrompts.render("shortTermImpact");

// Render local perspective
const localPerspective = evidencePrompts.render("localPerspective");

// Render global perspective
const globalPerspective = evidencePrompts.render("globalPerspective");

// Render cost analysis
const costAnalysis = evidencePrompts.render("costAnalysis");

// Render implementation feasibility
const implementationFeasibility = evidencePrompts.render("implementationFeasibility");
```