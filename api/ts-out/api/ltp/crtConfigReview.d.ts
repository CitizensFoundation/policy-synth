import WebSocket from "ws";
export declare const renderUserPrompt: (crt: LtpCurrentRealityTreeData) => string;
export declare const renderSystemPrompt: () => string;
export declare const getConfigurationReview: (crt: LtpCurrentRealityTreeData, clientId: string, wsClients: Map<string, WebSocket>) => Promise<void>;
//# sourceMappingURL=crtConfigReview.d.ts.map