import { PolicySynthStandaloneAgent } from "@policysynth/agents/base/agentStandalone.js";
export declare class PsRagRouter extends PolicySynthStandaloneAgent {
    get modelTemperature(): number;
    get maxModelTokensOut(): number;
    systemMessage: (chatHistory: string) => PsModelMessage;
    userMessage: (question: string) => PsModelMessage;
    getRoutingData(userQuestion: string, chatHistory: string): Promise<PsRagRoutingResponse>;
}
interface PsRagRoutingResponse {
    rewrittenUserQuestionForVectorDatabaseSearch: string;
    countryUserIsAskingAbout?: string;
}
export {};
//# sourceMappingURL=router.d.ts.map