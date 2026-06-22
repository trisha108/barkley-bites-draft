import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { connectDB } from "@/lib/mongodb";
import { UserModel } from "@/models/User";

const resetSchema = z.object({
  token: z.string().min(10),
  password: z.string().min(8),
});

export async function POST(request: Request) {
  const json = await request.json().catch(() => null);
  const parsed = resetSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid reset payload" }, { status: 400 });
  }

  await connectDB();
  const user = await UserModel.findOne({
    passwordResetToken: parsed.data.token,
    passwordResetExpires: { $gt: new Date() },
  });

  if (!user) {
    return NextResponse.json({ error: "Reset link is invalid or has expired" }, { status: 400 });
  }

  user.passwordHash = await bcrypt.hash(parsed.data.password, 12);
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  return NextResponse.json({ ok: true });
}
