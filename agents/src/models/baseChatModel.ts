
// /home/robert/Scratch/policy-synth-engineer-tests/agents/src/models/baseChatModel.ts

export abstract class BaseChatModel {
  abstract generate(
    messages: { role: string; message: string }[],
    streaming?: boolean,
    streamingCallback?: Function
  ): Promise<any>;

  abstract getNumTokensFromMessages(
    messages: { role: string; message: string }[]
  ): Promise<number>;
}
