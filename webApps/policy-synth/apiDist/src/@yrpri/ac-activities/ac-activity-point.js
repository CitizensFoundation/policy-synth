import { __decorate, __metadata } from "tslib";
import { html, css } from 'lit';
import { property, customElement } from 'lit/decorators.js';
import { YpBaseElementWithLogin } from '../common/yp-base-element-with-login.js';
import { YpNavHelpers } from '../common/YpNavHelpers.js';
import '../yp-magic-text/yp-magic-text.js';
import '../yp-point/yp-point.js';
let AcActivityPoint = class AcActivityPoint extends YpBaseElementWithLogin {
    static get styles() {
        return [
            super.styles,
            css `
        .pointContainer {
        }
        .point {
          padding: 8px;
          margin: 8px;
        }

        .pointText {
          margin-bottom: 16px;
          padding: 16px;
          width: 360px;
        }

        yp-point {
          margin-bottom: 36px;
        }

        @media (max-width: 480px) {
          yp-point {
            width: 100%;
          }
        }

        .pointLayout {
          width: 46%;
        }

        .postName {
          padding-left: 32px;
          font-weight: bold;
          font-size: 24px;
          padding-bottom: 12px;
        }

        .actionInfo {
          font-size: 22px;
          margin-top: 16px;
          padding-left: 16px;
        }

        .post-name {
          font-size: 26px;
          padding-bottom: 8px;
          margin: 0;
          padding-top: 0;
          margin-top: 8px;
          margin-left: 24px;
        }

        .withCursor {
          cursor: pointer;
        }

        [hidden] {
          display: none !important;
        }
      `
        ];
    }
    render() {
        return html `
      <div class="layout vertical pointContainer">
        <div
          class="actionInfo withCursor"
          ?hidden="${!this.isUpVote}"
          @click="${this._goToPoint}">
          ${this.t('point.forAdded')}...
        </div>
        <div
          class="actionInfo withCursor"
          ?hidden="${!this.isDownVote}"
          @click="${this._goToPoint}">
          ${this.t('point.againstAdded')}...
        </div>
        <div class="layout vertical">
          <yp-magic-text
            class="post-name withCursor"
            @click="${this._goToPoint}"
            textOnly
            textType="postName"
            .contentLanguage="${this.activity.Post.language}"
            .content="${this.activity.Post.name}"
            .contentId="${this.activity.Post.id}">
          </yp-magic-text>
          <yp-point
            hideUser
            .linkPoint="${!this.postId}"
            class="card"
            .point="${this.activity.Point}"></yp-point>
        </div>
      </div>
    `;
    }
    _goToPoint() {
        if (!this.postId && this.activity) {
            YpNavHelpers.goToPost(this.activity.Post.id, this.activity.Point.id, this.activity);
        }
    }
    get isUpVote() {
        return this.activity.Point && this.activity.Point.value > 0;
    }
    get isDownVote() {
        return this.activity.Point && this.activity.Point.value < 0;
    }
};
__decorate([
    property({ type: Object }),
    __metadata("design:type", Object)
], AcActivityPoint.prototype, "activity", void 0);
__decorate([
    property({ type: Number }),
    __metadata("design:type", Number)
], AcActivityPoint.prototype, "postId", void 0);
AcActivityPoint = __decorate([
    customElement('ac-activity-point')
], AcActivityPoint);
export { AcActivityPoint };
//# sourceMappingURL=ac-activity-point.js.map