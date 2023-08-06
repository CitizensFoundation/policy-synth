import { css, html, nothing } from 'lit';
import { property, customElement } from 'lit/decorators.js';

import './@yrpri/common/yp-image.js';

import { CpsStageBase } from './cps-stage-base.js';

const projects = [
  {
    id: 1,
    title: 'Save Democracy',
    imageUrl:
      'https://cps-images.citizens.is/projects/2/subProblems/images/1_v10.png',
    description:
      'Our first test project. Our first test project. Our first test project. Our first test project. Our first test project. Our first test project. Our first test project. ',
  },
  {
    id: 2,
    title: 'Democracy Undermined',
    imageUrl:
      'https://cps-images.citizens.is/projects/2/subProblems/images/17_v10.png',
    description:
      'Authoritarians who prioritize political outcomes over independent processes are using unfair and often illegal tactics, including political violence and changes to policies, procedures, and election administration',
  },
] as PsProjectData[];

@customElement('cps-home')
export class CpsSubProblems extends CpsStageBase {
  async connectedCallback() {
    super.connectedCallback();
    window.appGlobals.activity(`Home - open`);
  }

  updated(changedProperties: Map<string | number | symbol, unknown>): void {
    super.updated(changedProperties);
  }
  disconnectedCallback(): void {
    super.disconnectedCallback();
    window.appGlobals.activity(`Home - close`);
  }

  static get styles() {
    return [
      super.styles,
      css`
        .subContainer {
          max-width: 960px;
          margin-top: 32px;
          padding: 16px;
        }

        .projectItem {
          background-color: var(--md-sys-color-surface-variant);
          color: var(--md-sys-color-on-surface-variant);
          border-radius: 16px;
          margin: 16px;
          width: 100%;
          max-width: 420px;
          padding: 0;
        }

        .projectTitle {
          font-size: 32px;
          background-color: var(--md-sys-color-primary);
          color: var(--md-sys-color-on-primary);
          width:100%;
          max-width: 420px;
          height: 100%;
          padding: 0;
          margin: 0;
          margin-top: -4px;
        }

        .projectDescription {
          padding: 16px;
          height: 90px;
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
          padding: 24px;
          max-width: 960px;
          color: var(--md-sys-color-surface-variant);
          background-color: var(--md-sys-color-on-surface-variant);
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

      `,
    ];
  }

  renderProject(project: PsProjectData) {
    return html`
      <a href="/projects/${project.id}" @click="${() => window.scrollTo(0,0)}">
        <div class="projectItem layout vertical center-center">
          <div class="projectImage">
            <img width="420" height="240" src="${project.imageUrl}" />
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
    return html`
      <div class="topContainer layout vertical center-center">
        <img
          height="300"
          src="https://yrpri-usa-production-direct-assets.s3.amazonaws.com/Robert_Bjarnason_High_quality_abstract_new_high_tech_new_wave.__61a9b3d8-7533-4841-a99e-ef036fed1fbf.png"
        />
        <div class="title">${this.t('Welcome to Policy Synth')}</div>
        <div class="layout horizontal center-justified wrap">
          ${projects.map(project => this.renderProject(project))}
        </div>
        <div class="subContainer layout vertical center-center">
          <div class="title">
            ${this.t(
              'Bringing together the best of collective and artificial intelligence'
            )}
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
              >${this.t('Visit our project GitHub Page')}</a
            >
          </div>
        </div>
      </div>
    `;
  }
}
