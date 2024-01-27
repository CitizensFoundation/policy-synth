import WebSocket from "ws";
export declare const renderUserMessage: (effect: string, causes: string[], valdiationReview: string) => string;
export declare const runValidationChain: (crt: LtpCurrentRealityTreeData, clientId: string, wsClients: Map<string, WebSocket>, parentNode: LtpCurrentRealityTreeDataNode, currentUDE: string, chatLog: PsSimpleChatLog[], parentNodes: LtpCurrentRealityTreeDataNode[] | undefined, effect: string, causes: string[], validationReview: string, customSystemPrompts?: Map<number, string> | undefined) => Promise<void>;
//# sourceMappingURL=crtValidationChain.d.ts.map