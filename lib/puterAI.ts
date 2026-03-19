// Puter.js supported model list: https://docs.puter.com/AI/chat/
// Using gpt-4o as the reliable default; claude models require specific naming
const MODEL = "gpt-4o-mini";
const AI_TIMEOUT_MS = 15_000;

export function isPuterAvailable(): boolean {
  const available =
    typeof window !== "undefined" &&
    typeof (window as any).puter !== "undefined" &&
    typeof (window as any).puter.ai !== "undefined";

  console.log("[puterAI] isPuterAvailable:", available, {
    hasWindow: typeof window !== "undefined",
    hasPuter: typeof (window as any).puter !== "undefined",
    hasPuterAI: typeof (window as any).puter?.ai !== "undefined",
  });

  return available;
}

function assertPuter(): void {
  if (!isPuterAvailable()) {
    throw new Error(
      "Puter AI is not available. The puter.js script may not have loaded yet."
    );
  }
}

/** Rejects with a timeout error if the promise doesn't resolve in time. */
function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new Error(`[puterAI] TIMEOUT after ${ms}ms: ${label}`)),
      ms
    );
    promise.then(
      (val) => { clearTimeout(timer); resolve(val); },
      (err) => { clearTimeout(timer); reject(err); }
    );
  });
}

export async function generatePersonaResponse(
  systemPrompt: string,
  userQuestion: string
): Promise<string> {
  assertPuter();
  console.log("[puterAI] generatePersonaResponse — calling puter.ai.chat, model:", MODEL);
  try {
    const response = await withTimeout(
      (window as any).puter.ai.chat(
        [
          { role: "system", content: systemPrompt },
          { role: "user", content: userQuestion },
        ],
        { model: MODEL }
      ),
      AI_TIMEOUT_MS,
      "generatePersonaResponse"
    );
    console.log("[puterAI] generatePersonaResponse — got response");
    const r = response as any;
    return r?.message?.content ?? r?.text ?? String(response);
  } catch (err) {
    console.error("[puterAI] generatePersonaResponse FAILED:", err);
    return "AI unavailable, using rule-based response";
  }
}

export async function generateStreamingResponse(
  systemPrompt: string,
  userQuestion: string,
  onChunk: (text: string) => void
): Promise<string> {
  assertPuter();
  console.log("[puterAI] generateStreamingResponse — calling puter.ai.chat (stream), model:", MODEL);
  try {
    const streamPromise = (window as any).puter.ai.chat(
      [
        { role: "system", content: systemPrompt },
        { role: "user", content: userQuestion },
      ],
      { model: MODEL, stream: true }
    );

    const stream = await withTimeout(streamPromise, AI_TIMEOUT_MS, "getStream");
    console.log("[puterAI] generateStreamingResponse — stream opened, reading chunks...");

    let full = "";
    let chunkCount = 0;

    // Wrap the entire stream consumption in a timeout
    await withTimeout(
      (async () => {
        for await (const part of stream as AsyncIterable<any>) {
          const text = part?.text ?? part?.delta?.text ?? "";
          if (text) {
            full += text;
            chunkCount++;
            onChunk(text);
          }
        }
      })(),
      AI_TIMEOUT_MS,
      "consumeStream"
    );

    console.log(`[puterAI] generateStreamingResponse — complete, ${chunkCount} chunks, ${full.length} chars`);
    return full;
  } catch (err) {
    console.error("[puterAI] generateStreamingResponse FAILED:", err);
    const fallback = "AI unavailable, using rule-based response";
    onChunk(fallback);
    return fallback;
  }
}

export async function generateAnalysis(prompt: string): Promise<any> {
  assertPuter();
  console.log("[puterAI] generateAnalysis — calling puter.ai.chat, model:", MODEL);
  try {
    const response = await withTimeout(
      (window as any).puter.ai.chat(prompt, { model: MODEL }),
      AI_TIMEOUT_MS,
      "generateAnalysis"
    );
    const r = response as any;
    const raw = r?.message?.content ?? r?.text ?? String(response);
    console.log("[puterAI] generateAnalysis — got response, parsing JSON...");

    const jsonMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[1].trim());
    }

    const braceMatch = raw.match(/(\{[\s\S]*\})/);
    if (braceMatch) {
      return JSON.parse(braceMatch[1]);
    }

    const bracketMatch = raw.match(/(\[[\s\S]*\])/);
    if (bracketMatch) {
      return JSON.parse(bracketMatch[1]);
    }

    console.warn("[puterAI] generateAnalysis — no JSON found in response, returning raw");
    return { raw };
  } catch (err) {
    console.error("[puterAI] generateAnalysis FAILED:", err);
    throw new Error(`Failed to generate or parse AI analysis: ${err}`);
  }
}
