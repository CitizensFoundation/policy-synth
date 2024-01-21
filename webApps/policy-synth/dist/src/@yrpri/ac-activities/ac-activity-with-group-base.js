import { __decorate, __metadata } from "tslib";
import { YpBaseElement } from '../common/yp-base-element.js';
import { property } from 'lit/decorators.js';
export class AcActivityWithGroupBase extends YpBaseElement {
    get hasGroupHeader() {
        return (this.activity &&
            this.activity.Group &&
            this.activity.Group.name !=
                'hidden_public_group_for_domain_level_points' &&
            !this.postId &&
            !this.groupId);
    }
    get groupTitle() {
        if (this.activity.Group && !!this.postId && !this.groupId) {
            let title = '';
            if (!this.communityId &&
                this.activity.Community &&
                this.activity.Community.name != this.activity.Group.name) {
                title += this.activity.Community.name + ' - ';
            }
            title += this.activity.Group.name;
            return title;
        }
        else {
            return '';
        }
    }
}
__decorate([
    property({ type: Number }),
    __metadata("design:type", Number)
], AcActivityWithGroupBase.prototype, "postId", void 0);
__decorate([
    property({ type: Number }),
    __metadata("design:type", Number)
], AcActivityWithGroupBase.prototype, "groupId", void 0);
__decorate([
    property({ type: Number }),
    __metadata("design:type", Number)
], AcActivityWithGroupBase.prototype, "communityId", void 0);
__decorate([
    property({ type: Object }),
    __metadata("design:type", Object)
], AcActivityWithGroupBase.prototype, "activity", void 0);
//# sourceMappingURL=ac-activity-with-group-base.js.map