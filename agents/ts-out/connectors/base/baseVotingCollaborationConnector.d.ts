import { PsBaseConnector } from "./baseConnector.js";
export declare abstract class PsBaseVotingCollaborationConnector extends PsBaseConnector {
    abstract login(): Promise<void>;
    abstract postItems(groupId: number, items: any): Promise<boolean>;
}
//# sourceMappingURL=baseVotingCollaborationConnector.d.ts.map