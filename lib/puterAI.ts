const MODEL = "claude-sonnet-4-6";

export function isPuterAvailable(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.puter !== "undefined" &&
    typeof window.puter.ai !== "undefined"
  );
}

function assertPuter(): void {
  if (!isPuterAvailable()) {
    throw new Error(
      "Puter AI is not available. The puter.js script may not have loaded yet."
    );
  }
}

export async function generatePersonaResponse(
  systemPrompt: string,
  userQuestion: string
): Promise<string> {
  assertPuter();
  try {
    const response = await window.puter.ai.chat(
      [
        { role: "system", content: systemPrompt },
        { role: "user", content: userQuestion },
      ],
      { model: MODEL }
    );
    return response?.message?.content ?? response?.text ?? String(response);
  } catch {
    return "AI unavailable, using rule-based response";
  }
}

export async function generateStreamingResponse(
  systemPrompt: string,
  userQuestion: string,
  onChunk: (text: string) => void
): Promise<string> {
  assertPuter();
  try {
    const stream = await window.puter.ai.chat(
      [
        { role: "system", content: systemPrompt },
        { role: "user", content: userQuestion },
      ],
      { model: MODEL, stream: true }
    );

    let full = "";
    for await (const part of stream) {
      const text = part?.text ?? "";
      if (text) {
        full += text;
        onChunk(text);
      }
    }
    return full;
  } catch {
    const fallback = "AI unavailable, using rule-based response";
    onChunk(fallback);
    return fallback;
  }
}

export async function generateAnalysis(prompt: string): Promise<any> {
  assertPuter();
  try {
    const response = await window.puter.ai.chat(prompt, { model: MODEL });
    const raw =
      response?.message?.content ?? response?.text ?? String(response);

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

    return { raw };
  } catch {
    throw new Error("Failed to generate or parse AI analysis");
  }
}
