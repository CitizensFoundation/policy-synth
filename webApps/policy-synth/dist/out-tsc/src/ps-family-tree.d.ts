import './@yrpri/common/yp-image.js';
import { YpBaseElement } from './@yrpri/common/yp-base-element.js';
export declare class PsFamilyTree extends YpBaseElement {
    memory: IEngineInnovationMemoryData;
    subProblemIndex: number;
    solution: IEngineSolution;
    connectedCallback(): Promise<void>;
    disconnectedCallback(): void;
    static get styles(): any[];
    getParentSolution(parent: string): IEngineSolution;
    renderFamilyTree(currentSolution: IEngineSolution, first?: boolean, isMutatedFrom?: boolean): any;
    render(): import("lit-html").TemplateResult<1>;
}
//# sourceMappingURL=ps-family-tree.d.ts.map