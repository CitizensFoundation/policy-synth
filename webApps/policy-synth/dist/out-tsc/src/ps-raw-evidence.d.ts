import { nothing } from 'lit';
import './@yrpri/common/yp-image.js';
import '@material/web/select/outlined-select.js';
import '@material/web/select/select-option.js';
import '@material/web/iconbutton/outlined-icon-button.js';
import '@material/web/iconbutton/filled-icon-button.js';
import '@material/web/progress/circular-progress.js';
import '@material/web/button/text-button.js';
import { YpBaseElement } from './@yrpri/common/yp-base-element.js';
export declare class PsRawEvidence extends YpBaseElement {
    memory: IEngineInnovationMemoryData;
    policy: PSPolicy;
    activeSubProblemIndex: number;
    activeRawEvidence: PSEvidenceRawWebPageData[];
    groupedRawEvidence: Record<string, PSEvidenceRawWebPageData[]>;
    loading: boolean;
    showDropdown: boolean;
    showFullList: Record<string, boolean>;
    handleScroll(): void;
    connectedCallback(): Promise<void>;
    updated(changedProperties: Map<string | number | symbol, unknown>): void;
    setupRawEvidence(): void;
    disconnectedCallback(): void;
    formatSearchType(searchType: string): string;
    loadRawEvidence(): Promise<void>;
    static get styles(): any[];
    renderHeader(evidence: PSEvidenceRawWebPageData): import("lit-html").TemplateResult<1>;
    scrollToEvidenceType(evidenceType: string): void;
    renderDropdown(): import("lit-html").TemplateResult<1>;
    renderPieceOfEvidence(evidence: PSEvidenceRawWebPageData): import("lit-html").TemplateResult<1>;
    camelCaseToRegular(text: string): string;
    renderShortList(url: string, title: string, list: string[]): typeof nothing | import("lit-html").TemplateResult<1>;
    toggleShowFullList(key: string): void;
    renderActiveRawEvidence(): import("lit-html").TemplateResult<1>;
    render(): typeof nothing | import("lit-html").TemplateResult<1>;
    static rawPolicyCache: Record<string, PSEvidenceRawWebPageData[]>;
}
//# sourceMappingURL=ps-raw-evidence.d.ts.map