import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { UserModel } from "@/models/User";
import { getCurrentUser } from "@/lib/auth";
import { ROTATING_QUESTIONS, type QuestionField } from "@/data/rotating-questions";

const MS_PER_DAY = 1000 * 60 * 60 * 24;

// GET — returns the next question to ask this user, or null if none are due
export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ question: null });
  }

  const log = new Map(
    (user.questionLog ?? []).map((entry) => [entry.field, new Date(entry.answeredAt)]),
  );

  const now = Date.now();

  // Find the first question, in fixed order, that has never been answered
  // OR was answered but is now due for a re-ask.
  const next = ROTATING_QUESTIONS.find((q) => {
    const answeredAt = log.get(q.field);
    if (!answeredAt) return true; // never answered
    if (q.reaskAfterDays === null) return false; // only-ever-once, already done
    const daysSince = (now - answeredAt.getTime()) / MS_PER_DAY;
    return daysSince >= q.reaskAfterDays;
  });

  if (!next) {
    return NextResponse.json({ question: null });
  }

  // Pre-fill with whatever answer might already be on the profile (for re-asks)
  const currentValue = (user.profile as Record<string, unknown> | undefined)?.[next.field] ?? "";

  return NextResponse.json({
    question: {
      field: next.field,
      question: next.question,
      inputType: next.inputType,
      options: next.options ?? null,
      currentValue,
    },
  });
}

// POST — saves the answer to the given field and logs when it was answered
export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const field = body?.field as QuestionField | undefined;
  const value = body?.value;

  const validField = ROTATING_QUESTIONS.find((q) => q.field === field);
  if (!validField || value === undefined) {
    return NextResponse.json({ error: "Invalid field or value" }, { status: 400 });
  }

  await connectDB();

  await UserModel.updateOne(
    { _id: user._id },
    {
      $set: { [`profile.${field}`]: value },
      $pull: { questionLog: { field } },
    },
  );

  await UserModel.updateOne(
    { _id: user._id },
    {
      $push: { questionLog: { field, answeredAt: new Date() } },
    },
  );

  return NextResponse.json({ ok: true });
}

// PATCH — used for "skip this question", logs it as answered with an empty
// value so it doesn't keep reappearing every single login
export async function PATCH(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const field = body?.field as QuestionField | undefined;

  const validField = ROTATING_QUESTIONS.find((q) => q.field === field);
  if (!validField) {
    return NextResponse.json({ error: "Invalid field" }, { status: 400 });
  }

  await connectDB();

  await UserModel.updateOne(
    { _id: user._id },
    { $pull: { questionLog: { field } } },
  );
  await UserModel.updateOne(
    { _id: user._id },
    { $push: { questionLog: { field, answeredAt: new Date() } } },
  );

  return NextResponse.json({ ok: true });
}
