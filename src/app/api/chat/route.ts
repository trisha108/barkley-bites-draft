import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { OrderModel } from "@/models/Order";
import { getCurrentUser } from "@/lib/auth";
import { products } from "@/data/products";

const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent";

// TODO: Swap in a real key once available — see .env.local
const GEMINI_API_KEY_PLACEHOLDER = "PLACEHOLDER_GEMINI_API_KEY";

type Message = { role: "user" | "assistant"; content: string };

async function buildSystemPrompt(): Promise<string> {
  await connectDB();

  // Pull product catalogue from the same static source of truth used by
  // cart/checkout/Stripe, so the chatbot never quotes a price or product
  // that doesn't match what the customer is actually charged.
  const inStockProducts = products.filter((p) => p.inStock);

  const productLines = inStockProducts
    .map(
      (p) =>
        `- ${p.name} ($${p.price}) — ${p.tagline}. ${p.description} Ingredients: ${(p.ingredients ?? []).join(", ") || "see product page"}. Feeding guide: ${p.feedingGuide}`,
    )
    .join("\n");

  // Pull the logged-in user's profile + recent orders, if any
  const user = await getCurrentUser();
  let profileSection = `
CURRENT USER: Guest (not signed in).
Be welcoming and helpful. Mention once, naturally, that creating an account
unlocks personalised recommendations for their dog. Do not push it.
`;

  if (user) {
    const profile = user.profile;
    const recentOrders = await OrderModel.find({ user: user._id })
      .sort({ createdAt: -1 })
      .limit(5)
      .select("orderNumber status items total createdAt")
      .lean();

    const orderLines = recentOrders.length
      ? recentOrders
          .map(
            (o) =>
              `  - Order ${o.orderNumber} (${o.status}): ${o.items.map((i) => `${i.quantity}x ${i.name}`).join(", ")} — $${o.total}`,
          )
          .join("\n")
      : "  No orders yet.";

    profileSection = `
CURRENT CUSTOMER PROFILE:
- Owner: ${profile?.owner_first_name ?? user.name} ${profile?.owner_last_name ?? ""}
- Dog: ${profile?.pet_name ?? "not provided yet"} (${profile?.pet_breed ?? "breed unknown"}, ${profile?.pet_age_years ?? "age unknown"} years old, ${profile?.pet_weight_lbs ?? "weight unknown"} lbs)
- Sex: ${profile?.pet_sex || "not recorded"}
- Health conditions: ${profile?.health_conditions || "none recorded"}
- Recent orders:
${orderLines}

PERSONALIZATION RULES:
- Always address the dog by name if known.
- Reference recent orders naturally when relevant.
- If health conditions are recorded, factor them into every food recommendation.
- If the customer mentions a new vet recommendation or health update, acknowledge it and say you will note it on their profile.
`;
  }

  return `You are Biscuit, the friendly AI assistant for Barkley Bites — a boutique seafood-first dog food brand based in Dallas, Texas, founded by Schuyler Ford.

YOUR PERSONALITY:
- You sound like Schuyler at the dog park — warm, knowledgeable, casual, never salesy.
- You give real, specific answers, not vague corporate-speak.
- You are prescriptive: when someone describes a situation, suggest something specific.
- You never push ordering. You educate first, recommend second.

CURRENT LIVE PRODUCT CATALOGUE (always up to date, pulled directly from the store):
${productLines}

WHY BARKLEY BITES:
Human grade, small batch, ready-to-eat pet meals using local seafood market trimmings, no preservatives, no by-products, no fillers. Founded on the idea of using fresh-grade salmon — including cuts that would otherwise go to waste — to make food that's better for dogs than anything mass-produced.

FOOD TRANSITION ADVICE:
- Days 1-2: 25% Barkley Bites, 75% old food
- Days 3-4: 50/50
- Days 5-6: 75% Barkley Bites, 25% old food
- Day 7+: Full Barkley Bites

WHAT YOU DO NOT DO:
- Never invent products or prices not listed in the live catalogue above.
- Never give veterinary medical diagnoses.
- Never promise features that do not exist yet.
- If you do not know something specific, say: "I don't have that detail just yet, I'll flag it for Schuyler who can give you the proper answer." and end your reply with exactly: [CONTACT_SCHUYLER]

ESCALATE TO SCHUYLER for: pet loss, medical concerns, order issues, anything requiring a human decision. Always say you will flag it for Schuyler to follow up personally.

RESPONSE STYLE: 2-4 sentences for simple questions, slightly longer for complex ones. Warm but not over the top.

${profileSection}`;
}

export async function POST(req: NextRequest) {
  try {
    const { messages } = (await req.json()) as { messages: Message[] };

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "messages array required" }, { status: 400 });
    }

    const systemPrompt = await buildSystemPrompt();

    const recentMessages = messages.slice(-12);
    const contents: { role: string; parts: { text: string }[] }[] = [];

    for (const msg of recentMessages) {
      const geminiRole = msg.role === "assistant" ? "model" : "user";
      if (contents.length > 0 && contents[contents.length - 1].role === geminiRole) continue;
      contents.push({ role: geminiRole, parts: [{ text: msg.content }] });
    }
    while (contents.length > 0 && contents[0].role === "model") contents.shift();

    if (contents.length === 0) {
      return NextResponse.json({ error: "no valid user message found" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY ?? GEMINI_API_KEY_PLACEHOLDER;

    const MAX_ATTEMPTS = 3;
    let lastErrorMessage = "I'm having trouble responding right now. Please try again!";

    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: systemPrompt }] },
          contents,
          generationConfig: { temperature: 0.75, maxOutputTokens: 1000, topP: 0.9 },
        }),
      });

      const data = await response.json();

      if (data.error) {
        console.error(`Gemini error (attempt ${attempt}/${MAX_ATTEMPTS}):`, data.error);
        lastErrorMessage = data.error.message ?? lastErrorMessage;

        const isTransient = data.error.code === 503 || data.error.code === 429;
        if (isTransient && attempt < MAX_ATTEMPTS) {
          await new Promise((r) => setTimeout(r, attempt * 1000));
          continue;
        }
        return NextResponse.json({ error: lastErrorMessage }, { status: 500 });
      }

      const candidate = data.candidates?.[0];
      const finishReason = candidate?.finishReason;
      const reply = candidate?.content?.parts?.[0]?.text;

      if (!reply) {
        if (attempt < MAX_ATTEMPTS) {
          await new Promise((r) => setTimeout(r, attempt * 1000));
          continue;
        }
        return NextResponse.json({ reply: lastErrorMessage });
      }

      if (finishReason === "MAX_TOKENS") {
        console.warn("Gemini reply hit MAX_TOKENS and may be truncated.");
      }

      return NextResponse.json({ reply });
    }

    return NextResponse.json({ error: lastErrorMessage }, { status: 500 });
  } catch (err) {
    console.error("Chat route error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
