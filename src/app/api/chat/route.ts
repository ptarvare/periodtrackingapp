import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(request: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY is not configured." },
      { status: 500 }
    );
  }

  try {
    const { message, history, context } = await request.json();

    const prior = (history ?? [])
      .slice(-10)
      .map((m: { sender: string; text: string }) => ({
        role: m.sender === "user" ? ("user" as const) : ("assistant" as const),
        content: m.text,
      }));

    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 600,
      system: buildSystemPrompt(context),
      messages: [...prior, { role: "user", content: message }],
    });

    const text =
      response.content[0].type === "text"
        ? response.content[0].text
        : "I had trouble generating a response. Please try again.";

    return NextResponse.json({ text });
  } catch (err) {
    console.error("Chat API error:", err);
    return NextResponse.json({ error: "AI request failed." }, { status: 500 });
  }
}

function buildSystemPrompt(ctx: any): string {
  const { phase, dayOfCycle, phaseDay, cycleLength, daysUntilNextPeriod, ovulationDate, confidenceScore, profile } = ctx ?? {};

  return `You are Luna, a warm and knowledgeable menstrual cycle wellness assistant. You help women understand their cycle, optimise their lifestyle, and navigate hormonal health with confidence.

CURRENT USER DATA:
- Phase: ${phase ?? "Unknown"} — Cycle day ${dayOfCycle ?? "?"}, Phase day ${phaseDay ?? "?"}
- Cycle Length: ${cycleLength ?? 28} days
- Days Until Next Period: ${daysUntilNextPeriod ?? "Unknown"}
- Estimated Ovulation: ${ovulationDate ? new Date(ovulationDate).toDateString() : "Unknown"}
- Prediction Confidence: ${confidenceScore ?? 0}%
- Age: ${profile?.age ?? "Unknown"}
- Activity Level: ${profile?.activityLevel ?? "Unknown"}
- Diet Preference: ${profile?.dietaryPreference ?? "Unknown"}
- Health Conditions: ${profile?.conditions?.join(", ") || "None"}
- Goals: ${profile?.goals?.join(", ") || "None"}

RESPONSE GUIDELINES:
- Be warm, direct, and specific — no generic filler
- Always ground advice in the user's current phase and conditions
- For PCOS/PCOD: factor in insulin resistance and androgen effects
- Keep responses to 3–5 sentences unless more detail is asked for
- Use bullet points only when listing 3+ distinct items
- Add a one-line disclaimer when discussing supplements or symptoms that may need medical attention
- Never diagnose, treat, or claim to replace professional medical advice`;
}
