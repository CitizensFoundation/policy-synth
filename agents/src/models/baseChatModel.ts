
// /home/robert/Scratch/policy-synth-engineer-tests/agents/src/models/baseChatModel.ts

export abstract class BaseChatModel {
  abstract generate(
    messages: PsModelChatItem[],
    streaming?: boolean,
    streamingCallback?: Function
  ): Promise<any>;

  abstract getNumTokensFromMessages(
    messages: PsModelChatItem[]
  ): Promise<number>;
}
