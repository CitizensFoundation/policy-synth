import WebSocket from "ws";
export declare const renderFirstUserPromptWithTree: (currentUserMessage: string, currentRealityTree: LtpCurrentRealityTreeData, parentNode: LtpCurrentRealityTreeDataNode, currentUDE: string, parentNodes?: LtpCurrentRealityTreeDataNode[] | undefined) => string;
export declare const renderFirstUserPrompt: (effect: string, causes: string[], valdiationReview: string) => string;
export declare const renderSystemPrompt: () => string;
export declare const getRefinedCauses: (crt: LtpCurrentRealityTreeData, clientId: string, wsClients: Map<string, WebSocket>, parentNode: LtpCurrentRealityTreeDataNode, currentUDE: string, chatLog: PsSimpleChatLog[], parentNodes?: LtpCurrentRealityTreeDataNode[] | undefined, customSystemPrompts?: Map<number, string> | undefined, effect?: string, causes?: string[], validationReview?: string) => Promise<void>;
//# sourceMappingURL=crtAssistant.d.ts.map