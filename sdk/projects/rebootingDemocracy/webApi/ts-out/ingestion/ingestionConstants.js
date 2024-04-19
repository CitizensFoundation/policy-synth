const gpt4InTokenPrice = 0.01 / 1000;
const gpt4OutTokenPrice = 0.03 / 1000;
const gpt35_16kInTokenPrice = 0.001 / 1000;
const gpt35_16kOutTokenPrice = 0.002 / 1000;
// The total limit is 128k but we'll use the first 70k
const gpt4TotalTokenLimit = 70000;
const adaInTokenPrice = 0.0001;
const gpt35_16k_TPM = 1000000 * 3;
const gpt35_16k_RPM = 10000 * 3;
const gpt35_TPM = 750000;
const gpt35_RPM = 10000;
const gpt4_TPM = 150000 * 3;
const gpt4_RPM = 10000 * 3;
export class PsIngestionConstants {
    static ingestionMainModel = {
        name: "gpt-4-turbo",
        temperature: 0.0,
        maxOutputTokens: 4095,
        tokenLimit: gpt4TotalTokenLimit,
        inTokenCostUSD: gpt4InTokenPrice,
        outTokenCostUSD: gpt4OutTokenPrice,
        limitTPM: gpt4_TPM,
        limitRPM: gpt4_RPM,
        verbose: true
    };
    static ingestionRankingModel = {
        name: "gpt-4-turbo",
        temperature: 0.0,
        maxOutputTokens: 3,
        tokenLimit: gpt4TotalTokenLimit,
        inTokenCostUSD: gpt4InTokenPrice,
        outTokenCostUSD: gpt4OutTokenPrice,
        limitTPM: gpt4_TPM,
        limitRPM: gpt4_RPM,
        verbose: true
    };
}
//# sourceMappingURL=ingestionConstants.js.map