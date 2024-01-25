var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { css, html } from 'lit';
import { customElement } from 'lit/decorators.js';
import '@yrpri/webapp/common/yp-image.js';
import { PsStageBase } from './base/ps-stage-base.js';
const projects = [
    {
        id: 1,
        title: 'Democracy in Distress',
        imageUrl: 'https://cps-images.citizens.is/projects/1/problemStatement/images/916898992.png',
        description: 'The first test run is entirely automated except for the problem statement provided by us. All sub problems, entities and solutions with pros & cons are generated using GPT-4 & GPT-3.5. The context for solutions is obtained through curated web searches. This setup allows us to explore how human and AI-driven insights can work together to solve complex problems.',
    },
    /*{
      id: 2,
      title: 'Democracy Undermined',
      imageUrl:
        'https://cps-images.citizens.is/projects/2/subProblems/images/17_v10.png',
      description:
        'Authoritarians who prioritize political outcomes over independent processes are using unfair and often illegal tactics, including political violence and changes to policies, procedures, and election administration',
    },*/
];
let PsHome = class PsHome extends PsStageBase {
    async connectedCallback() {
        super.connectedCallback();
        window.psAppGlobals.activity(`Home - open`);
    }
    updated(changedProperties) {
        super.updated(changedProperties);
    }
    disconnectedCallback() {
        super.disconnectedCallback();
        window.psAppGlobals.activity(`Home - close`);
    }
    static get styles() {
        return [
            super.styles,
            css `
        .subContainer {
          max-width: 960px;
          margin-top: 8px;
          padding: 16px;
        }

        .projectItem {
          background-color: var(--md-sys-color-surface-variant);
          color: var(--md-sys-color-on-surface-variant);
          border-radius: 16px;
          margin: 16px;
          margin-top: 32px;
          width: 100%;
          max-width: 420px;
          padding: 0;
        }

        .projectTitle {
          font-size: 32px;
          background-color: var(--md-sys-color-primary);
          color: var(--md-sys-color-on-primary);
          width: 100%;
          max-width: 420px;
          height: 100%;
          padding: 0;
          margin: 0;
          margin-top: -4px;
        }

        .projectDescription {
          padding: 16px;
          height: 142px;
        }

        .projectTitleInner {
          padding: 16px;
          padding-bottom: 20px;
        }

        .projectImage {
          margin: 0;
          padding: 0;
        }

        .moreInfo {
          margin: 16px;
          margin-top: 0;
          font-size: 18px;
          padding: 24px;
          line-height: 1.5;
          max-width: 944px;
          border-radius: 24px;
          color: var(--md-sys-color-on-surface);
          background-color: var(--md-sys-color-surface);
        }

        a {
          text-decoration: none;
        }

        .gitHubLink {
          margin-top: 16px;
        }

        .gitHubLink a {
          text-decoration: underline;
        }

        .title {
          padding: 24px;
          margin-bottom: 0;
          color: var(--md-sys-color-primary);
          background-color: var(--md-sys-color-on-primary);
        }
        @media (max-width: 960px) {
          .projectItem,
          .projectTitle {
            max-width: 100%;
            width: 100%;
            margin: 0;
          }

          .projectTitle {
            font-size: 26px;
            margin-top: -3px;
          }

          .subContainer {
            max-width: 100%;
            margin-top: 8px;
            padding: 8px;
          }

          .moreInfo {
            margin: 8px;
            max-width: 100%;
            width: 100%;
          }

          .projectDescription {
            padding-bottom: 24px;
            height: 100%;
          }

          .title {
            font-size: 26px;
            padding: 16px;
            line-height: 1.45;
          }
        }
      `,
        ];
    }
    renderProject(project) {
        return html `
      <a href="/projects/${project.id}" @click="${() => window.scrollTo(0, 0)}">
        <div class="projectItem layout vertical center-center">
          <div class="projectImage">
            <img
              width="${this.wide ? 420 : 343}"
              height="${this.wide ? 240 : 196}"
              src="${project.imageUrl}"
            />
          </div>
          <div class="projectTitle layout vertical center-center">
            <div class="projectTitleInner">${project.title}</div>
          </div>
          <div class="projectDescription">${project.description}</div>
        </div>
      </a>
    `;
    }
    render() {
        return html `
      <div class="topContainer layout vertical center-center">
        <img
          height="${this.wide ? 300 : 190}"
          src="https://yrpri-usa-production-direct-assets.s3.amazonaws.com/Robert_Bjarnason_High_quality_abstract_new_high_tech_new_wave.__61a9b3d8-7533-4841-a99e-ef036fed1fbf.png"
        />
        <div class="title">${this.t('Welcome to Policy Synth')}</div>
        <div class="layout horizontal center-justified wrap">
          ${projects.map(project => this.renderProject(project))}
        </div>
        <div class="subContainer layout vertical center-center">
          <div class="title">
            ${this.t('Bringing together the best of collective and artificial intelligence')}
          </div>
          <div class="moreInfo">
            Our project embodies a unique effort to intertwine human insights
            and artificial intelligence to grapple with complex policy dilemmas.
            We are in the process of building a state-of-the-art platform where
            policymakers, citizens, and AI can engage in a collective discourse.
            This collaborative interaction is expected to not only expedite
            decision-making processes but also augment their quality, paving the
            way for more inventive and efficacious policy resolutions.
          </div>

          <div class="gitHubLink">
            <a
              href="https://github.com/CitizensFoundation/policy-synth"
              target="_blank"
              >${this.t('Join us and collaborate on Github')}</a
            >
          </div>
        </div>
      </div>
    `;
    }
};
PsHome = __decorate([
    customElement('ps-home')
], PsHome);
export { PsHome };
//# sourceMappingURL=ps-home.js.map