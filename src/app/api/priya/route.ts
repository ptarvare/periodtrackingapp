import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(request: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY is not configured." }, { status: 500 });
  }

  try {
    const { message, history, context } = await request.json();

    const prior = (history ?? [])
      .slice(-8)
      .map((m: { role: string; text: string }) => ({
        role: m.role === "user" ? ("user" as const) : ("assistant" as const),
        content: m.text,
      }));

    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 300,
      system: buildPriyaPrompt(context),
      messages: [...prior, { role: "user", content: message }],
    });

    const text =
      response.content[0].type === "text"
        ? response.content[0].text
        : "I couldn't generate a response — please try again.";

    return NextResponse.json({ text });
  } catch (err) {
    console.error("Priya API error:", err);
    return NextResponse.json({ error: "Request failed." }, { status: 500 });
  }
}

function buildPriyaPrompt(ctx: any): string {
  const { name, phase, dayOfCycle, goal } = ctx ?? {};

  const goalLabel: Record<string, string> = {
    train_smarter: "train smarter",
    start_a_family: "start a family",
    stay_on_top: "stay on top of her game",
    know_my_body: "know her body better",
    something_else: "her personal wellness goal",
  };

  return `You are Priya Tarvare — a Certified Personal Trainer and Integrative Nutrition Practitioner with 6+ years of experience. You specialise in hormonal health, cycle-synced training, and nutrition for women.

You're talking to ${name ?? "a Luna user"} right now. Here's her context:
- Current phase: ${phase ?? "unknown"} (Day ${dayOfCycle ?? "?"} of her cycle)
- Goal: ${goalLabel[goal] ?? "general wellness"}

Your personality:
- Warm, direct, and practical — like a knowledgeable friend who doesn't waffle
- You give real answers, not generic advice
- Short responses — 2 to 4 sentences unless they ask for more detail
- No jargon, no "that's a great question", no filler
- You always tie your answer to where she is in her cycle when relevant
- You never diagnose or replace a doctor — if something sounds medical, you say so clearly

You are the AI version of Priya. The real Priya is available for personal sessions via Instagram @fit_coach__priya. If someone asks to speak to Priya directly or book a session, mention that.`;
}
