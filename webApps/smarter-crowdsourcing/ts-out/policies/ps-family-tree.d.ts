import '@yrpri/webapp/common/yp-image.js';
import { YpBaseElement } from '@yrpri/webapp/common/yp-base-element.js';
export declare class PsFamilyTree extends YpBaseElement {
    memory: PsBaseMemoryData;
    subProblemIndex: number;
    solution: IEngineSolution;
    connectedCallback(): Promise<void>;
    disconnectedCallback(): void;
    static get styles(): any[];
    getParentSolution(parent: string): IEngineSolution;
    renderFamilyTree(currentSolution: IEngineSolution, first?: boolean, isMutatedFrom?: boolean): any;
    render(): import("lit").TemplateResult<1>;
}
//# sourceMappingURL=ps-family-tree.d.ts.map