import { PolicySynthAgent } from "@policysynth/agents/base/agent.js";
import { PsConnectorFactory } from "@policysynth/agents/connectors/base/connectorFactory.js";
import { PsConnectorClassTypes } from "@policysynth/agents/connectorTypes.js";
export class SheetsJobDescriptionImportAgent extends PolicySynthAgent {
    sheetsConnector;
    sheetName = "Sheet1"; // Default
    startRow = 1; // The first row that includes headers
    startCol = 1; // The first column, "A"
    maxRows = 10000; // Adjust if needed
    maxCols = 60; // Enough columns to capture all fields
    skipAiModels = true;
    constructor(agent, memory, startProgress, endProgress, sheetName) {
        super(agent, memory, startProgress, endProgress);
        // Default to a single Sheets connector.
        this.sheetsConnector = PsConnectorFactory.getConnector(this.agent, this.memory, PsConnectorClassTypes.Spreadsheet, true);
        if (!this.sheetsConnector) {
            throw new Error("Google Sheets connector not found");
        }
        if (sheetName) {
            this.sheetName = sheetName;
        }
    }
    /**
     * Main entry point: Reads from the sheet, reconstructs jobDescriptions, returns them.
     */
    async importJobDescriptions() {
        await this.updateRangedProgress(0, "Starting Google Sheets import: " + this.sheetsConnector.name);
        // Read up to maxRows x maxCols
        const endColLetter = this.columnIndexToLetter(this.maxCols - 1);
        const range = `${this.sheetName}!A${this.startRow}:${endColLetter}${this.maxRows}`;
        const rows = await this.sheetsConnector.getRange(range);
        if (!rows || rows.length < 3) {
            // Must have at least 3 rows: 2 header rows + 1 data row
            this.logger.warn("No data or insufficient rows in sheet: " + this.sheetsConnector.name);
            return { jobDescriptions: [], connectorName: this.sheetsConnector.name };
        }
        // first two rows are headers
        const fullHeaders = rows[0];
        // const shortHeaders = rows[1]; // if needed
        const dataRows = rows.slice(2);
        // Reconstruct JSON
        const jobDescriptions = this.reconstructJobDescriptionsFromSheet(fullHeaders, dataRows);
        await this.updateRangedProgress(100, "Google Sheets import completed");
        return { jobDescriptions, connectorName: this.sheetsConnector.name };
    }
    /**
     * NEW METHOD:
     * Gather *all* spreadsheet connectors and import job descriptions from each,
     * returning an array of results.
     */
    async importJobDescriptionsFromAllConnectors() {
        await this.updateRangedProgress(0, "Starting import from all spreadsheet connectors...");
        const connectors = PsConnectorFactory.getAllConnectors(this.agent, this.memory, PsConnectorClassTypes.Spreadsheet, true);
        if (!connectors || connectors.length === 0) {
            this.logger.warn("No spreadsheet connectors found.");
            return [];
        }
        const originalConnector = this.sheetsConnector; // Keep the original for safety
        const results = [];
        // We'll update progress in uniform increments for each connector
        const increment = Math.max(1, Math.floor(100 / connectors.length));
        let currentProgress = 0;
        for (const connector of connectors) {
            this.sheetsConnector = connector;
            // Optionally, if each connector references a different sheet name,
            // you might have logic to set this.sheetName = connector.someSheetId;
            const importedData = await this.importJobDescriptions();
            results.push(importedData);
            currentProgress += increment;
            await this.updateRangedProgress(Math.min(currentProgress, 100), `Imported from connector ${connector.name ?? "(Unnamed)"}`);
        }
        // Restore the original connector
        this.sheetsConnector = originalConnector;
        await this.updateRangedProgress(100, "Completed import from all connectors.");
        return results;
    }
    /**
     * Rebuild the jobDescriptions array based on the same headers used in the export.
     */
    reconstructJobDescriptionsFromSheet(fullHeaders, dataRows) {
        const jobDescriptions = [];
        for (const row of dataRows) {
            const jobDesc = this.buildJobDescriptionObject(fullHeaders, row);
            jobDescriptions.push(jobDesc);
        }
        return jobDescriptions;
    }
    /**
     * Build a single JobDescription from a single row and the corresponding headers.
     */
    buildJobDescriptionObject(headers, row) {
        const getValue = (headerName) => {
            const idx = headers.indexOf(headerName);
            if (idx === -1 || idx >= row.length)
                return "";
            return row[idx] ?? "";
        };
        this.logger.debug(`Headers: ${headers.join(", ")}`);
        const job = {
            text: "",
            titleCode: getValue("titleCode"),
            variant: getValue("variant"),
            classOfService: getValue("classOfService"),
            workWeek: getValue("workWeek"),
            bargainUnit: getValue("bargainUnit"),
            classCode: getValue("classCode"),
            salaryRange: getValue("salaryRange"),
            workMonth: getValue("workMonth"),
            deptCode: getValue("deptCode"),
            url: getValue("url"),
            name: getValue("name"),
            classification: this.parseJsonIfPossible(getValue("classification")) || "",
            error: getValue("error"),
            multiLevelJob: this.parseBooleanIfPossible(getValue("multiLevelJob")),
            cscRevised: this.parseBooleanIfPossible(getValue("cscRevised")),
            notes: getValue("notes"),
            // Provide a single OccupationalCategory object
            occupationalCategory: this.parseOccupationalCategory(getValue("occupationalCategory.mainCategory"), getValue("occupationalCategory.subCategory")),
            // Build out the required degreeAnalysis
            degreeAnalysis: {
                maximumDegreeRequirement: getValue("degreeAnalysis.maximumDegreeRequirement"),
                includesMultipleJobLevelsWithDifferentEducationalRequirements: this.parseBooleanIfPossible(getValue("degreeAnalysis.includesMultipleJobLevelsWithDifferentEducationalRequirements")) || false,
                needsCollegeDegree: this.parseBooleanIfPossible(getValue("degreeAnalysis.needsCollegeDegree")) || false,
                educationRequirements: this.parseEducationRequirements(getValue("degreeAnalysis.educationRequirements")),
                degreeRequirementStatus: {
                    isDegreeMandatory: this.parseBooleanIfPossible(getValue("degreeAnalysis.degreeRequirementStatus.isDegreeMandatory")) || false,
                    hasAlternativeQualifications: this.parseBooleanIfPossible(getValue("degreeAnalysis.degreeRequirementStatus.hasAlternativeQualifications")) || false,
                    alternativeQualifications: this.parseStringList(getValue("degreeAnalysis.degreeRequirementStatus.alternativeQualifications")),
                    multipleQualificationPaths: this.parseBooleanIfPossible(getValue("degreeAnalysis.degreeRequirementStatus.multipleQualificationPaths")) || false,
                    isDegreeAbsolutelyRequired: this.parseBooleanIfPossible(getValue("degreeAnalysis.degreeRequirementStatus.isDegreeAbsolutelyRequired")) || false,
                    substitutionPossible: this.parseBooleanIfPossible(getValue("degreeAnalysis.degreeRequirementStatus.substitutionPossible")) || false,
                },
                mandatoryStatusExplanations: {
                    degreeRequirementExplanation: getValue("degreeAnalysis.mandatoryStatusExplanations.degreeRequirementExplanation"),
                    bothTrueExplanation: getValue("degreeAnalysis.mandatoryStatusExplanations.bothTrueExplanation"),
                    bothFalseExplanation: getValue("degreeAnalysis.mandatoryStatusExplanations.bothFalseExplanation"),
                },
                professionalLicenseRequirement: {
                    isLicenseRequired: this.parseBooleanIfPossible(getValue("degreeAnalysis.professionalLicenseRequirement.isLicenseRequired")) || false,
                    licenseDescription: getValue("degreeAnalysis.professionalLicenseRequirement.licenseDescription"),
                    issuingAuthority: getValue("degreeAnalysis.professionalLicenseRequirement.issuingAuthority"),
                    includesDegreeRequirement: this.parseBooleanIfPossible(getValue("degreeAnalysis.professionalLicenseRequirement.includesDegreeRequirement")) || false,
                },
                barriersToNonDegreeApplicants: getValue("degreeAnalysis.barriersToNonDegreeApplicants"),
                validationChecks: {
                    cscRevisedConsistency: getValue("degreeAnalysis.validationChecks.cscRevisedConsistency"),
                    requiredAlternativeExplanationConsistency: getValue("degreeAnalysis.validationChecks.requiredAlternativeExplanationConsistency"),
                    barriersToNonDegreeApplicantsConsistency: getValue("degreeAnalysis.validationChecks.barriersToNonDegreeApplicantsConsistency"),
                    licenseIncludesDegreeRequirementConsistency: getValue("degreeAnalysis.validationChecks.licenseIncludesDegreeRequirementConsistency"),
                    alternativesIfTrueConsistency: getValue("degreeAnalysis.validationChecks.alternativesIfTrueConsistency"),
                    degreeMandatoryConsistency: getValue("degreeAnalysis.validationChecks.degreeMandatoryConsistency"),
                    alternativeQualificationsConsistency: getValue("degreeAnalysis.validationChecks.alternativeQualificationsConsistency"),
                    educationRequirementsConsistency: getValue("degreeAnalysis.validationChecks.educationRequirementsConsistency"),
                    needsCollegeDegreeConsistency: getValue("degreeAnalysis.validationChecks.needsCollegeDegreeConsistency"),
                },
            },
            // We won’t fill readabilityAnalysis by default, but we can do so if needed:
            readabilityAnalysis: undefined,
            readingLevelGradeAnalysis: undefined,
            readabilityAnalysisTextTSNPM: undefined,
        };
        // Possibly parse readingLevelGradeAnalysis or P2 if exported:
        const rluDifficult = this.parseStringList(getValue("readingLevelGradeAnalysis.difficultPassages"));
        const rluGrade = getValue("readingLevelGradeAnalysis.readabilityLevel");
        if (rluDifficult.length > 0 || rluGrade) {
            job.readingLevelGradeAnalysis = {
                readabilityLevelExplanation: "Imported from sheet",
                readabilityLevel: rluGrade,
                difficultPassages: rluDifficult,
            };
        }
        const rlu2Difficult = this.parseStringList(getValue("readingLevelGradeAnalysis.difficultPassages"));
        const rlu2Grade = getValue("readingLevelGradeAnalysis.readabilityLevel");
        if (rlu2Difficult.length > 0 || rlu2Grade) {
            job.readingLevelGradeAnalysis = {
                readabilityLevelExplanation: "Imported from sheet",
                readabilityLevel: rlu2Grade,
                difficultPassages: rlu2Difficult,
            };
        }
        // If your sheet includes columns for readingLevelAnalysisResults:
        const rlarDifficult = this.parseStringList(getValue("readingLevelAnalysisResults.difficultPassages"));
        const rlarGrade = getValue("readingLevelAnalysisResults.readabilityLevel");
        if (rlarDifficult.length > 0 || rlarGrade) {
            // This property must exist in your interface or it will fail
            job.readingLevelGradeAnalysis = {
                readabilityLevelExplanation: "Imported from sheet",
                readabilityLevel: rlarGrade,
                difficultPassages: rlarDifficult,
            };
        }
        //this.logger.info(`Built job description object: ${JSON.stringify(job, null, 2)}`);
        return job;
    }
    /**
     * Parse a single OccupationalCategory object from main + sub columns.
     * If your sheet might have multiple categories, pick the first or combine them
     * into a single object.
     */
    parseOccupationalCategory(mainCatRaw, subCatRaw) {
        if (!mainCatRaw && !subCatRaw) {
            return {
                id: "",
                mainCategory: "",
                descriptionMainCategory: "",
                subCategories: [],
            };
        }
        // The exporter might join multiple categories with "\r\n|\r\n", so parse.
        const mainList = mainCatRaw.split("\r\n|\r\n").filter(Boolean);
        const subList = subCatRaw.split("\r\n|\r\n").filter(Boolean);
        const firstMain = mainList[0] ?? "";
        const firstSub = subList[0] ?? "";
        return {
            id: "",
            mainCategory: firstMain,
            descriptionMainCategory: "",
            subCategories: [
                {
                    subCategory: firstSub,
                    descriptionSubCategory: "",
                    link: "",
                    id: "",
                },
            ],
        };
    }
    /**
     * Convert a joined educationRequirements string into an array of JobEducationRequirement.
     */
    parseEducationRequirements(eduReqStr) {
        if (!eduReqStr)
            return [];
        return eduReqStr
            .split("\r\n|\r\n")
            .filter(Boolean)
            .map((line) => {
            // e.g. "bachelorsDegree: Must have a BA"
            const [rawType, rawQuote] = line.split(/:(.*)/s);
            return {
                type: (rawType || "").trim(),
                evidenceQuote: (rawQuote || "").trim(),
                isMandatory: false, // or parse from text if you have columns for that
            };
        });
    }
    parseBooleanIfPossible(str) {
        if (!str)
            return undefined;
        const lower = str.trim().toLowerCase();
        if (lower === "true")
            return true;
        if (lower === "false")
            return false;
        return undefined;
    }
    parseJsonIfPossible(str) {
        if (!str)
            return null;
        try {
            return JSON.parse(str);
        }
        catch {
            return str; // fallback to raw string if invalid JSON
        }
    }
    parseStringList(str) {
        if (!str)
            return [];
        return str.split("\r\n|\r\n").filter(Boolean);
    }
    /**
     * Convert zero-based column index to spreadsheet letter (0->A, 25->Z, 26->AA)
     */
    columnIndexToLetter(index) {
        let temp = index;
        let letter = "";
        while (temp >= 0) {
            letter = String.fromCharCode((temp % 26) + 65) + letter;
            temp = Math.floor(temp / 26) - 1;
        }
        return letter;
    }
}
//# sourceMappingURL=sheetsImport.js.map