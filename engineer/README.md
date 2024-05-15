### Policy Synth Engineer
Policy Synth Engineer is an automated programming tool designed for Typescript projects, utilizing multi scale AI agents to streamline coding tasks such as feature development, bug fixes, and refactoring. It automates extensive web research for coding assistance and is initially created for Typescript but can automate programming of any type.

## Limitations
* Designed for TypeScript but you can easily subclass the PsEngineerAgent and remove the loading of typescript data in your implementation there. You will also have to sublcass the PsEngineerInitialAnalyzer and it's System Prompt so not only to add typescript files to the Engineer's all important GPT4 context.
* Engineer does not yet do npm installs so important to pre-install any npm packages Engineer should work on. This is important as Engineer will attempt to locate the typedefs .d.ts files in the node_modules/ folder and works best with the relevant typedefs in the context at all relevant times
* Engineer has only had limited testing. We started this project when we realized how good the gpt2 test version was at coding. Wer had initial version ready Sunday 12. May and it sort of worked with GPT-4 Turbo with the automated web research enabled. But when we plugged in GPT-4o it's worked for all the limited issues we've sent it's way.

## Engineer Agent Design

![PS - Engineer-1](https://github.com/CitizensFoundation/policy-synth/assets/43699/29f01ea9-6809-4f8f-be94-f7e0a9cf0425)

![PS - Engineer-2](https://github.com/CitizensFoundation/policy-synth/assets/43699/79257d07-f800-4419-8d32-cbc994307b4e)

![PS - Engineer-3](https://github.com/CitizensFoundation/policy-synth/assets/43699/80612116-401f-49ae-bda1-1ea5ffccd3bc)

![PS - Engineer-4](https://github.com/CitizensFoundation/policy-synth/assets/43699/1c8a421a-3ef7-4b11-ae68-e19ffff9c05b)
