import { getResend } from "@/lib/resend";

type OrderEmailPayload = {
  email: string;
  orderNumber: string;
  total: number;
};

export async function sendOrderConfirmationEmail(order: OrderEmailPayload) {
  const resend = getResend();
  const from = process.env.RESEND_FROM;
  if (!resend || !from) {
    return;
  }

  await resend.emails.send({
    from,
    to: order.email,
    subject: `Your Barkley order ${order.orderNumber} is confirmed`,
    html: `<p style="font-family:system-ui">Thanks for choosing Barkley Bites.</p>
      <p style="font-family:system-ui">Order <strong>${order.orderNumber}</strong> is confirmed for <strong>$${order.total.toFixed(
        2,
      )}</strong>.</p>`,
  });
}
