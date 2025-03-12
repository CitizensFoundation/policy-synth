export class JobDescriptionBucketAgent {
    /**
     * Buckets job descriptions with readability mismatches into groups based on occupational classification.
     * It selects one job description for each bucket except for "professional" and "clerical" buckets,
     * where up to three job descriptions are chosen. For the "no classification" bucket, one sample is chosen.
     *
     * @param jobDescriptions Array of JobDescription objects.
     * @returns An object mapping bucket keys to arrays of selected JobDescription objects.
     */
    static bucketJobDescriptions(jobDescriptions) {
        // Filter job descriptions where the readability analysis indicates a mismatch.
        const mismatched = jobDescriptions.filter((jd) => jd.readingLevelGradeAnalysis &&
            jd.readingLevelGradeAnalysis.readingLevelMatchesDegreeRequirement === false);
        // Group the filtered job descriptions by their occupational classification.
        const buckets = {};
        mismatched.forEach((jd) => {
            let key = "no classification";
            // Make sure occupationalCategory is an array with at least one item
            if (Array.isArray(jd.occupationalCategory) && jd.occupationalCategory.length > 0) {
                const mainCat = jd.occupationalCategory[0].mainCategory;
                // Ensure mainCategory is a non-empty string
                if (mainCat && mainCat.trim() !== "") {
                    key = mainCat.toLowerCase();
                }
            }
            if (!buckets[key]) {
                buckets[key] = [];
            }
            buckets[key].push(jd);
        });
        // For each bucket, select candidates according to the following rules:
        // - For buckets "professional", "occp_professional", "clerical", or "occp_clerical", select up to 3 job descriptions.
        // - For the "no classification" bucket, select 1 job description.
        // - For all other buckets, select 1 job description.
        const selected = {};
        for (const key in buckets) {
            const descriptions = buckets[key];
            if (key === "professional" ||
                key === "occp_professional") {
                selected[key] = descriptions.slice(0, 3);
            }
            else if (key === "clerical" ||
                key === "occp_clerical" ||
                key === "occp_service" ||
                key === "service") {
                selected[key] = descriptions.slice(0, 2);
            }
            else if (key === "no classification") {
                selected[key] = descriptions.slice(0, 3);
            }
            else {
                selected[key] = descriptions.slice(0, 1);
            }
        }
        return selected;
    }
}
//# sourceMappingURL=bucketAgent.js.map