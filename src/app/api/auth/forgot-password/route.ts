import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { z } from "zod";
import { connectDB } from "@/lib/mongodb";
import { UserModel } from "@/models/User";
import { sendPasswordResetEmail } from "@/lib/email-password";

const forgotSchema = z.object({
  email: z.string().email(),
});

export async function POST(request: Request) {
  const json = await request.json().catch(() => null);
  const parsed = forgotSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }

  await connectDB();
  const email = parsed.data.email.toLowerCase();
  const user = await UserModel.findOne({ email });
  if (!user) {
    return NextResponse.json({ ok: true });
  }

  const token = crypto.randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + 1000 * 60 * 60);

  user.passwordResetToken = token;
  user.passwordResetExpires = expires;
  await user.save();

  await sendPasswordResetEmail(email, token);

  return NextResponse.json({ ok: true });
}
