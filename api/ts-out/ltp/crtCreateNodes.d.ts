export declare const renderSystemPrompt: (causeToExmine?: LtpCurrentRealityTreeDataNode | undefined, parentNodes?: LtpCurrentRealityTreeDataNode[] | undefined) => string;
export declare const renderUserPrompt: (currentRealityTree: LtpCurrentRealityTreeData, currentUDE: string, causeToExmine?: LtpCurrentRealityTreeDataNode | undefined, parentNodes?: LtpCurrentRealityTreeDataNode[] | undefined) => string;
export declare const filterTopCauses: (parsedMessages: CrtPromptJson[]) => CrtPromptJson[];
export declare const convertToNodes: (topCauses: CrtPromptJson[], nodeType: CrtNodeType, debug?: CrtDebugData | undefined) => LtpCurrentRealityTreeDataNode[];
export declare const getParentNodes: (nodes: LtpCurrentRealityTreeDataNode[], currentNodeId: string, parentNodes?: LtpCurrentRealityTreeDataNode[]) => LtpCurrentRealityTreeDataNode[] | undefined;
export declare const identifyCauses: (crt: LtpCurrentRealityTreeData, currentUDE: string, currentparentNode?: LtpCurrentRealityTreeDataNode | undefined) => Promise<LtpCurrentRealityTreeDataNode[]>;
//# sourceMappingURL=crtCreateNodes.d.ts.map