import { createOpenAI } from "@ai-sdk/openai";
import { streamText, type ModelMessage } from "ai";
import {
  createLovableAiGatewayRunIdFetch,
  getLovableAiGatewayRunId,
  withLovableAiGatewayRunIdHeader,
} from "./run-id.server";

const BASE_URL = "https://ai.gateway.lovable.dev/v1";
export const MODEL = "openai/gpt-6-astra";

function getKey() {
  const key = process.env["LOVABLE_API_KEY"];
  if (!key) throw new Error("AI is not configured (missing LOVABLE_API_KEY).");
  return key;
}

function makeProvider(initialRunId?: string) {
  const apiKey = getKey();
  const runIdFetch = createLovableAiGatewayRunIdFetch(initialRunId);
  const provider = createOpenAI({
    baseURL: BASE_URL,
    apiKey,
    headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
    fetch: runIdFetch.fetch,
  });
  return { provider, runIdFetch };
}

const providerOptions = {
  openai: {
    store: false,
    forceReasoning: true,
    reasoningEffort: "low",
    reasoningSummary: "auto",
    include: ["reasoning.encrypted_content"],
  },
};

/** Streaming chat response in AI SDK UI-message protocol. */
export function streamChatResponse(request: Request, messages: ModelMessage[], instructions: string) {
  const { provider, runIdFetch } = makeProvider(getLovableAiGatewayRunId(request));
  const result = streamText({
    model: provider.responses(MODEL),
    instructions,
    messages,
    abortSignal: request.signal,
    providerOptions,
  });
  return withLovableAiGatewayRunIdHeader(result.toUIMessageStreamResponse({ sendReasoning: true }), runIdFetch);
}

/** One-shot text, streamed server-side and consumed to final text. */
export async function generateFinalText(instructions: string, prompt: string) {
  const { provider } = makeProvider();
  const result = streamText({
    model: provider.responses(MODEL),
    instructions,
    prompt,
    providerOptions,
  });
  return await result.text;
}
