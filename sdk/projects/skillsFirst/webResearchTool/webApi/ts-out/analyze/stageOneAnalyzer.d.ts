import { PolicySynthAgentBase } from "@policysynth/agents/baseAgent.js";
import { OpenAI } from "openai";
export declare class StepOneAnalyzer extends PolicySynthAgentBase {
    openaiClient: OpenAI;
    systemPrompt: string;
    analyze(): Promise<void>;
    deduplicate(items: string[], passes?: number): Promise<string[]>;
    shuffleArray(array: string[]): string[];
    chunkArray(array: string[], chunkSize: number): string[][];
}
//# sourceMappingURL=stageOneAnalyzer.d.ts.map