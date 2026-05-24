export interface PsAssistantToolExecutionContext {
  sessionId?: string;
  callId: string;
  toolName: string;
  metadata?: Record<string, unknown>;
}

export interface PsAssistantToolResult<TData = unknown> {
  success: boolean;
  data?: TData;
  message?: string;
  hiddenContext?: string;
  html?: string;
  clientEvents?: Array<{
    name: string;
    details: unknown;
  }>;
  error?: string;
  metadata?: Record<string, unknown>;
}

export interface PsAssistantTool<TData = unknown> {
  name: string;
  description?: string;
  parameters?: Record<string, unknown>;
  strict?: boolean;
  handler: (
    args: Record<string, unknown>,
    context: PsAssistantToolExecutionContext
  ) => Promise<PsAssistantToolResult<TData>>;
}

export interface PsAssistantToolCall {
  id: string;
  callId?: string;
  name: string;
  arguments: string | Record<string, unknown>;
}

export interface PsAssistantToolExecutionOutput {
  call: PsAssistantToolCall;
  result: PsAssistantToolResult;
  parsedArguments: Record<string, unknown>;
  output: string;
}

export interface PsAssistantToolExecutionOptions {
  allowedTools?: Iterable<string>;
  sessionId?: string;
  metadata?: Record<string, unknown>;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

export function parseAssistantToolArguments(
  args: string | Record<string, unknown>
): Record<string, unknown> {
  if (typeof args !== "string") {
    return args;
  }

  if (!args.trim()) {
    return {};
  }

  const parsed = JSON.parse(args) as unknown;
  if (!isRecord(parsed)) {
    throw new Error("Tool arguments must parse to a JSON object");
  }

  return parsed;
}

export function stringifyAssistantToolOutput(
  result: PsAssistantToolResult
): string {
  const outputValue =
    result.hiddenContext ??
    result.data ??
    result.message ??
    result.error ??
    result.metadata ??
    { success: result.success };

  return typeof outputValue === "string"
    ? outputValue
    : JSON.stringify(outputValue);
}

export async function executeAssistantToolCall(
  call: PsAssistantToolCall,
  tools: PsAssistantTool[],
  options: PsAssistantToolExecutionOptions = {}
): Promise<PsAssistantToolExecutionOutput> {
  const allowedTools = options.allowedTools
    ? new Set(options.allowedTools)
    : undefined;

  if (allowedTools && !allowedTools.has(call.name)) {
    const result: PsAssistantToolResult = {
      success: false,
      error: `Tool ${call.name} is not allowed by policy`,
    };
    return {
      call,
      result,
      parsedArguments: {},
      output: stringifyAssistantToolOutput(result),
    };
  }

  const tool = tools.find((candidate) => candidate.name === call.name);
  if (!tool) {
    const result: PsAssistantToolResult = {
      success: false,
      error: `Unknown tool: ${call.name}`,
    };
    return {
      call,
      result,
      parsedArguments: {},
      output: stringifyAssistantToolOutput(result),
    };
  }

  let parsedArguments: Record<string, unknown>;
  try {
    parsedArguments = parseAssistantToolArguments(call.arguments);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Invalid tool arguments";
    const result: PsAssistantToolResult = {
      success: false,
      error: message,
    };
    return {
      call,
      result,
      parsedArguments: {},
      output: stringifyAssistantToolOutput(result),
    };
  }

  try {
    const result = await tool.handler(parsedArguments, {
      callId: call.callId ?? call.id,
      toolName: call.name,
      sessionId: options.sessionId,
      metadata: options.metadata,
    });

    return {
      call,
      result,
      parsedArguments,
      output: stringifyAssistantToolOutput(result),
    };
  } catch (error) {
    const result: PsAssistantToolResult = {
      success: false,
      error: error instanceof Error ? error.message : "Tool execution failed",
    };
    return {
      call,
      result,
      parsedArguments,
      output: stringifyAssistantToolOutput(result),
    };
  }
}
