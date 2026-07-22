export type PsWebSearchBuiltInTool = Extract<
  PsBuiltInTool,
  { type: "web_search" }
>;

export interface PsBuiltInToolIgnoredOption {
  option: keyof PsWebSearchBuiltInTool;
  reason: string;
}

export interface PsNormalizedWebSearchSource {
  url: string;
  title?: string | null;
}

export interface PsNormalizedWebSearchCitation
  extends PsNormalizedWebSearchSource {
  citedText?: string;
  startIndex?: number;
  endIndex?: number;
  partIndex?: number;
  indexUnit?: "utf8_byte" | "utf16_code_unit" | "unicode_code_point";
}

export interface PsNormalizedWebSearchEntryPoint {
  renderedContent?: string;
  sdkBlob?: string;
}

export interface PsNormalizedWebSearchCall {
  id?: string;
  status?: string;
  queries?: string[];
  sources?: PsNormalizedWebSearchSource[];
  citations?: PsNormalizedWebSearchCitation[];
  results?: unknown[];
  searchEntryPoint?: PsNormalizedWebSearchEntryPoint;
  error?: string;
}

export interface PsBuiltInToolsProviderMetadata {
  requested: Array<PsBuiltInTool["type"]>;
  ignoredOptions?: PsBuiltInToolIgnoredOption[];
  /** Provider-reported billable calls, when available. */
  webSearchCallCount?: number;
  webSearchCalls?: PsNormalizedWebSearchCall[];
  rawProviderData?: unknown;
}

export class PsBuiltInToolConfigurationError extends Error {
  readonly isPsNonRetryableModelError = true;

  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "PsBuiltInToolConfigurationError";
  }
}

export const getSingleWebSearchTool = (
  builtInTools: PsBuiltInTool[] | undefined,
  providerName: string
): PsWebSearchBuiltInTool | undefined => {
  if (!builtInTools?.length) {
    return undefined;
  }

  const unsupported = builtInTools.filter(
    (tool): tool is Extract<PsBuiltInTool, { type: "code_interpreter" }> =>
      tool.type !== "web_search"
  );
  if (unsupported.length) {
    const types = [...new Set(unsupported.map((tool) => tool.type))].join(", ");
    throw new PsBuiltInToolConfigurationError(
      `${providerName} does not support the requested built-in tool(s): ${types}. ` +
        "Only native web_search support is implemented for this provider."
    );
  }

  const webSearchTools = builtInTools.filter(
    (tool): tool is PsWebSearchBuiltInTool => tool.type === "web_search"
  );
  if (webSearchTools.length > 1) {
    throw new PsBuiltInToolConfigurationError(
      `${providerName} accepts at most one web_search built-in tool per request.`
    );
  }

  return webSearchTools[0];
};

export const getSearchContextIgnoredOption = (
  tool: PsWebSearchBuiltInTool | undefined,
  providerName: string
): PsBuiltInToolIgnoredOption[] | undefined => {
  if (!tool?.searchContextSize) {
    return undefined;
  }

  return [
    {
      option: "searchContextSize",
      reason: `${providerName} has no equivalent search-context-size control.`,
    },
  ];
};

export const getErrorStatus = (error: unknown): number | undefined => {
  if (typeof error !== "object" || error === null) {
    return undefined;
  }

  const candidate = error as {
    response?: { status?: number | string };
    status?: number | string;
    statusCode?: number | string;
  };
  const status =
    candidate.response?.status ?? candidate.status ?? candidate.statusCode;
  if (typeof status === "number" && Number.isFinite(status)) {
    return status;
  }
  if (typeof status === "string") {
    const parsed = Number.parseInt(status, 10);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
};

export const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === "string") {
    return error;
  }
  try {
    return JSON.stringify(error);
  } catch {
    return String(error);
  }
};

export const wrapBuiltInToolProviderError = (
  error: unknown,
  providerName: string,
  hasBuiltInTools: boolean
): unknown => {
  if (!hasBuiltInTools || error instanceof PsBuiltInToolConfigurationError) {
    return error;
  }

  const status = getErrorStatus(error);
  const message = getErrorMessage(error);
  const lowerMessage = message.toLowerCase();
  const referencesTool =
    lowerMessage.includes("web_search") ||
    lowerMessage.includes("web search") ||
    lowerMessage.includes("google_search") ||
    lowerMessage.includes("grounding") ||
    lowerMessage.includes("tool");

  if (status !== undefined && [400, 404, 422].includes(status) && referencesTool) {
    return new PsBuiltInToolConfigurationError(
      `${providerName} rejected the native web_search configuration: ${message}`,
      error instanceof Error ? { cause: error } : undefined
    );
  }

  return error;
};
