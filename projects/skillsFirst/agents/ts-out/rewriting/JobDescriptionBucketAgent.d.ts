export declare class JobDescriptionBucketAgent {
    /**
     * Buckets job descriptions with readability mismatches into groups based on occupational classification.
     * It selects one job description for each bucket except for "professional" and "clerical" buckets,
     * where up to three job descriptions are chosen. For the "no classification" bucket, one sample is chosen.
     *
     * @param jobDescriptions Array of JobDescription objects.
     * @returns An object mapping bucket keys to arrays of selected JobDescription objects.
     */
    static bucketJobDescriptions(jobDescriptions: JobDescription[]): {
        [bucket: string]: JobDescription[];
    };
}
//# sourceMappingURL=JobDescriptionBucketAgent.d.ts.map