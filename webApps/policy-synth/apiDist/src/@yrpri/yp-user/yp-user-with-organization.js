import { __decorate, __metadata } from "tslib";
import { html, css, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { Layouts } from '../../flexbox-literals/classes.js';
import { YpBaseElement } from '../common/yp-base-element.js';
import { YpMediaHelpers } from '../common/YpMediaHelpers.js';
import './yp-user-image.js';
//import moment from 'moment';
let YpUserWithOrganization = class YpUserWithOrganization extends YpBaseElement {
    constructor() {
        super(...arguments);
        this.hideImage = false;
        this.inverted = false;
    }
    static get styles() {
        return [
            super.styles,
            Layouts,
            css `
        yp-user-image {
          padding-right: 16px;
        }

        .name {
          padding-top: 4px;
          font-weight: bold;
          text-align: left;
          padding-right: 16px;
        }

        .name[inverted] {
          color: var(--ak-user-name-color, #444);
        }

        .orgImage {
          margin-left: 8px;
          width: 48px;
          min-width: 48px;
          height: 48px;
        }

        .rousnded {
          -webkit-border-radius: 25px;
          -moz-border-radius: 25px;
          border-radius: 25px;
          display: block;
        }

        .organizationName {
          color: #eee;
          text-align: left;
        }

        .organizationName[inverted] {
          color: #676767;
        }

        @media (max-width: 600px) {
          .orgImage {
            margin-right: 8px;
            margin-left: 4px;
          }
        }

        [hidden] {
          display: none !important;
        }

        .mainArea {
          padding-right: 8px;
        }
      `,
        ];
    }
    render() {
        return html `
      ${this.user
            ? html `
            <div class="layout horizontal mainArea" .title="${this.userTitle}">
              <yp-user-image
                .titlefromuser="${this.userTitle}"
                .user="${this.user}"
                ?hidden="${this.hideImage}"></yp-user-image>
              <div class="layout vertical">
                <div class="name" .inverted="${this.inverted}">
                  ${this.user.name}
                </div>
                <div
                  class="organizationName"
                  .inverted="${this.inverted}"
                  ?hidden="${!this.organizationName}">
                  ${this.organizationName}
                </div>
              </div>

              ${this.organizationImageUrl && this.organizationName
                ? html `
                    <img
                      width="48"
                      height="48"
                      .alt="${this.organizationName}"
                      sizing="cover"
                      ?hidden="${this.hideImage}"
                      class="orgImage"
                      src="${this.organizationImageUrl}" />
                  `
                : nothing}
            </div>
          `
            : nothing}
    `;
    }
    get userTitle() {
        if (this.user && this.titleDate) {
            return this.user.name; // + ' ' + moment(this.titleDate).fromNow();
        }
        else {
            return '';
        }
    }
    get organizationName() {
        if (this.user &&
            this.user.OrganizationUsers &&
            this.user.OrganizationUsers.length > 0 &&
            this.user.OrganizationUsers[0].name) {
            return this.user.OrganizationUsers[0].name;
        }
        else {
            return null;
        }
    }
    get organizationImageUrl() {
        if (this.user &&
            this.user.OrganizationUsers &&
            this.user.OrganizationUsers.length > 0 &&
            this.user.OrganizationUsers[0].OrganizationLogoImages &&
            this.user.OrganizationUsers[0].OrganizationLogoImages.length > 0 &&
            this.user.OrganizationUsers[0].OrganizationLogoImages[0].formats) {
            return YpMediaHelpers.getImageFormatUrl(this.user.OrganizationUsers[0].OrganizationLogoImages, 2);
        }
        else {
            return undefined;
        }
    }
};
__decorate([
    property({ type: Object }),
    __metadata("design:type", Object)
], YpUserWithOrganization.prototype, "user", void 0);
__decorate([
    property({ type: Object }),
    __metadata("design:type", Date)
], YpUserWithOrganization.prototype, "titleDate", void 0);
__decorate([
    property({ type: Boolean }),
    __metadata("design:type", Object)
], YpUserWithOrganization.prototype, "hideImage", void 0);
__decorate([
    property({ type: Boolean }),
    __metadata("design:type", Object)
], YpUserWithOrganization.prototype, "inverted", void 0);
YpUserWithOrganization = __decorate([
    customElement('yp-user-with-organization')
], YpUserWithOrganization);
export { YpUserWithOrganization };
//# sourceMappingURL=yp-user-with-organization.js.map