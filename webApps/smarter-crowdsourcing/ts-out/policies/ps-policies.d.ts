import { nothing } from 'lit';
import '@yrpri/webapp/common/yp-image.js';
import { PsStageBase } from '../base/ps-stage-base.js';
import '@material/web/chips/chip-set.js';
import '@material/web/chips/filter-chip.js';
import '@material/web/iconbutton/icon-button.js';
import '@material/web/select/outlined-select.js';
import '@material/web/select/select-option.js';
import '@material/web/iconbutton/outlined-icon-button.js';
import '@material/web/iconbutton/filled-icon-button.js';
import '@material/web/chips/input-chip.js';
import '@material/web/textfield/outlined-text-field.js';
import './ps-family-tree.js';
import './ps-raw-evidence.js';
export declare class PsPolicies extends PsStageBase {
    isDropdownVisible: boolean;
    searchText: string;
    activeFilteredPolicyIndex: number;
    isSearchVisible: boolean;
    hideExtraPolicyInformation: boolean;
    groupListScrollPositionY: number;
    lastKeys: any[];
    findBarProbablyOpen: boolean;
    updateRoutes(): void;
    setSubProblem(index: number): void;
    handleGroupButtonClick(groupIndex: number): Promise<void>;
    reset(): void;
    private touchStartX;
    private minSwipeDistance;
    policyListScrollPositionX: number;
    policyListScrollPositionY: number;
    connectedCallback(): Promise<void>;
    disconnectedCallback(): void;
    updateSwipeIndex(direction: string): void;
    handleKeyDown(e: KeyboardEvent): void;
    exitPolicyScreen(): void;
    handleTouchStart(e: TouchEvent): void;
    handleTouchEnd(e: TouchEvent): void;
    updated(changedProperties: Map<string | number | symbol, unknown>): void;
    static get styles(): (any[] | import("lit").CSSResult)[];
    get filteredPolicies(): PSPolicy[];
    render(): import("lit").TemplateResult<1> | typeof nothing;
    renderPolicyItem(policy: PSPolicy, index: number): import("lit").TemplateResult<1>;
    renderSubProblemScreen(subProblem: PsSubProblem): import("lit").TemplateResult<1>;
    renderChipSet(subProblem: PsSubProblem): import("lit").TemplateResult<1> | typeof nothing;
    toggleSearchVisibility(): void;
    renderSearchField(): import("lit").TemplateResult<1>;
    handleSearchBlur(): void;
    renderFilterChips(items: PSPolicy[][], startIndex: number): import("lit").TemplateResult<1>[];
    handleDropdownChange(e: Event): void;
    toggleDropdownVisibility(): void;
    resetDropdown(): void;
    renderDropdown(middleItems: PSPolicy[][], startIndex: number): import("lit").TemplateResult<1> | typeof nothing;
    camelCaseToRegular(text: string): string;
    renderRatings(policy: PSPolicy): import("lit").TemplateResult<1>;
    renderPolicyNavigationButtons(policyIndex: number, policies: PSPolicy[]): import("lit").TemplateResult<1>;
    getPolicyImgHeight(): 314 | 150;
    getPolicyImgWidth(): 550 | 263;
    renderPolicyImage(policy: PSPolicy): import("lit").TemplateResult<1>;
    renderPolicyScreen(policyIndex: number): import("lit").TemplateResult<1> | typeof nothing;
}
//# sourceMappingURL=ps-policies.d.ts.map