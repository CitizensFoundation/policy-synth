# Job Description Review Agents

This folder contains helper agents that examine job descriptions for issues around education requirements and professional licensing. They are invoked by the main analysis workflow and each agent focuses on a specific aspect of the text.

## Agents

- **DetermineCollegeDegreeStatusAgent** – Parses the description for any mention of college or higher‑education requirements. It outputs whether a degree is needed, the highest degree referenced and a list of supporting evidence quotes.
- **DetermineProfessionalLicenseRequirementAgent** – Looks for professional license requirements that might imply a college degree. It also records the license type and issuing authority if available.
- **DetermineMandatoryStatusAgent** – Decides if the stated degree requirement is mandatory or if alternative qualifications allow multiple paths to qualify for the role. Produces short explanations when needed.
- **IdentifyBarriersAgent** – Searches for text that might discourage or block applicants who do not have a college degree and summarizes any such barriers.
- **ValidateJobDescriptionAgent** – Performs consistency checks across all extracted fields (degree requirements, alternatives, license data etc.) and marks each check as `pass`, `fail` or `n/a`.
- **ReadabilityFleshKncaidJobDescriptionAgent** – Calculates a Flesch‑Kincaid readability grade for the raw job description text using a local library.
- **ReadingLevelAnalysisAgent** – Uses the language model to highlight difficult passages and estimate the U.S. grade level needed to understand the entire description.
- **ReviewEvidenceQuoteAgent** – Verifies each evidence quote found for an education requirement to confirm that it actually supports the conclusion.

These agents strictly analyze job descriptions with respect to education and licensing concerns. Queue classes used to schedule them live elsewhere in the repository and are not documented here.

