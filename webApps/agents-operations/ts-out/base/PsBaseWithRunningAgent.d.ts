import { YpBaseElement } from "@yrpri/webapp/common/yp-base-element";
export declare class PsBaseWithRunningAgentObserver extends YpBaseElement {
    currentRunningAgentId: number | undefined;
    connectedCallback(): void;
    disconnectedCallback(): void;
    handleAgentChange(currentRunningAgentId: number | undefined): void;
}
//# sourceMappingURL=PsBaseWithRunningAgent.d.ts.map