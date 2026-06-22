import { NextResponse } from "next/server";
import { z } from "zod";
import { getResend } from "@/lib/resend";

const schema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  topic: z.string().min(1),
  message: z.string().min(10),
});

export async function POST(request: Request) {
  const json = await request.json().catch(() => null);
  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const resend = getResend();
  const from = process.env.RESEND_FROM;
  const to = process.env.RESEND_CONTACT_TO ?? process.env.RESEND_FROM;

  if (!resend || !from || !to) {
    return NextResponse.json({ error: "Email transport is not configured" }, { status: 500 });
  }

  await resend.emails.send({
    from,
    to,
    subject: `Barkley contact · ${parsed.data.topic}`,
    replyTo: parsed.data.email,
    html: `<p style="font-family:system-ui">From ${parsed.data.name} (${parsed.data.email})</p>
      <p style="font-family:system-ui">${parsed.data.message.replaceAll("\n", "<br/>")}</p>`,
  });

  return NextResponse.json({ ok: true });
}
