import Anthropic from "@anthropic-ai/sdk";

// Singleton client — reused across requests in the same process
let client: Anthropic | null = null;

function getClient(): Anthropic {
  if (!client) {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error("ANTHROPIC_API_KEY is not set in environment variables.");
    }
    client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return client;
}

export interface AnalysisRequest {
  systemPrompt: string;
  userPrompt: string;
  maxTokens?: number;
}

export interface AnalysisResult {
  content: string;
  inputTokens: number;
  outputTokens: number;
}

/**
 * Run a full (non-streaming) analysis. Used for the recommendation
 * because we need to parse the complete JSON before showing anything.
 */
export async function runAnalysis({
  systemPrompt,
  userPrompt,
  maxTokens = 3000,
}: AnalysisRequest): Promise<AnalysisResult> {
  const anthropic = getClient();

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: maxTokens,
    system: systemPrompt,
    messages: [{ role: "user", content: userPrompt }],
  });

  const content = message.content
    .filter((b) => b.type === "text")
    .map((b) => (b as { type: "text"; text: string }).text)
    .join("");

  return {
    content,
    inputTokens: message.usage.input_tokens,
    outputTokens: message.usage.output_tokens,
  };
}

/**
 * Parse the JSON response from Claude. Handles edge cases where
 * the model occasionally wraps JSON in markdown code fences.
 */
export function parseAnalysisResponse(raw: string): Record<string, unknown> {
  // Strip markdown fences if present
  const cleaned = raw
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  // Find the JSON object boundaries (handles leading whitespace or text)
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");

  if (start === -1 || end === -1) {
    throw new Error("No valid JSON object found in response");
  }

  const jsonStr = cleaned.slice(start, end + 1);

  try {
    return JSON.parse(jsonStr);
  } catch (e) {
    throw new Error(`JSON parse failed: ${e instanceof Error ? e.message : String(e)}`);
  }
}

/**
 * Rate limit tracker — in-memory per process.
 * Tracks API calls per user per hour to prevent abuse.
 * In production, use Redis or Upstash for distributed rate limiting.
 */
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(
  userId: string,
  limitPerHour = parseInt(process.env.ANALYSIS_RATE_LIMIT_PER_HOUR ?? "20", 10)
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const windowMs = 60 * 60 * 1000; // 1 hour

  const entry = rateLimitMap.get(userId);

  if (!entry || now > entry.resetAt) {
    // New window
    const newEntry = { count: 1, resetAt: now + windowMs };
    rateLimitMap.set(userId, newEntry);
    return { allowed: true, remaining: limitPerHour - 1, resetAt: newEntry.resetAt };
  }

  if (entry.count >= limitPerHour) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }

  entry.count++;
  return { allowed: true, remaining: limitPerHour - entry.count, resetAt: entry.resetAt };
}
