import { YpServerApi } from "@yrpri/webapp/common/YpServerApi";
export declare class LtpServerApi extends YpServerApi {
    baseLtpPath: string;
    constructor(urlPath?: string);
    getCrt(groupId: number): Promise<LtpCurrentRealityTreeData>;
    createTree(crt: LtpCurrentRealityTreeData): Promise<LtpCurrentRealityTreeData>;
    updateNodeChildren(treeId: string | number, nodeId: string, childrenIds: string[]): Promise<void>;
    reviewConfiguration(wsClientId: string, crt: LtpCurrentRealityTreeData): Promise<string>;
    createDirectCauses(treeId: string | number, parentNodeId: string): Promise<LtpCurrentRealityTreeDataNode[]>;
    addDirectCauses(treeId: string | number, parentNodeId: string, causes: string[], type: CrtNodeType): Promise<LtpCurrentRealityTreeDataNode[]>;
    sendGetRefinedCauseQuery(crtTreeId: string | number, crtNodeId: string, chatLog: PsAiChatWsMessage[], wsClientId: string, effect?: string, causes?: string[], validationErrors?: string[]): Promise<LtpChatBotCrtMessage>;
    runValidationChain(crtTreeId: string | number, crtNodeId: string, chatLog: PsAiChatWsMessage[], wsClientId: string, effect: string, causes: string[]): Promise<LtpChatBotCrtMessage>;
    updateNode(treeId: string | number, updatedNode: LtpCurrentRealityTreeDataNode): Promise<void>;
    deleteNode(treeId: string | number, nodeId: string): Promise<void>;
}
//# sourceMappingURL=LtpServerApi.d.ts.map