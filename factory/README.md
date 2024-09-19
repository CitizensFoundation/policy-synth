# Policy Synth Engineer
Policy Synth Engineer is an automated programming tool, utilizing multi-scale AI agents to streamline coding tasks such as feature development, bug fixes, and refactoring. Initially created for TypeScript, it can automate programming of any type by leveraging extensive web research for coding assistance. Policy Synth Engineer is a flexible, object-oriented class library. 

## Limitations

- **TypeScript Focus:** Although designed for TypeScript, you can subclass the `PsEngineerAgent` to remove the loading of TypeScript data in your implementation. You'll also need to subclass the `PsEngineerInitialAnalyzer` and its system prompt to modify the Engineer's context beyond TypeScript files.
  
- **npm Package Management:** Engineer does not currently handle npm installs. Ensure any required npm packages are pre-installed. This is important as Engineer will attempt to locate the typedefs (`.d.ts` files) in the `node_modules/` folder and works best with the relevant typedefs in the context at all relevant times.
  
- **Limited Testing:** Engineer has only had limited testing. The project began when we realized the potential of the GPT-4o test version (im-a-good-gpt2-chatbot) for coding. An initial version of Engineer was ready on Sunday, May 12th, and it sort of worked with GPT-4 Turbo with automated web research enabled but slow with a lot of compile errors/coding rounds. The following day, we integrated then new GPT-4o, and it has worked for all the limited issues we've encountered so far.

## Engineer Agents Overview

![PS - Engineer-1](https://github.com/CitizensFoundation/policy-synth/assets/43699/29f01ea9-6809-4f8f-be94-f7e0a9cf0425)

![PS - Engineer-2](https://github.com/CitizensFoundation/policy-synth/assets/43699/79257d07-f800-4419-8d32-cbc994307b4e)

![PS - Engineer-3](https://github.com/CitizensFoundation/policy-synth/assets/43699/80612116-401f-49ae-bda1-1ea5ffccd3bc)

![PS - Engineer-4](https://github.com/CitizensFoundation/policy-synth/assets/43699/1c8a421a-3ef7-4b11-ae68-e19ffff9c05b)
