import { headers } from "next/headers";
import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { connectDB } from "@/lib/mongodb";
import { OrderModel, PaymentModel } from "@/models";
import { getStripe } from "@/lib/stripe";
import { sendOrderConfirmationEmail } from "@/lib/email-order";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const stripe = getStripe();
  const body = await request.text();
  const headerList = await headers();
  const signature = headerList.get("stripe-signature");

  if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Missing webhook configuration" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const orderId = session.metadata?.orderId;
    if (!orderId) {
      return NextResponse.json({ received: true });
    }

    await connectDB();
    const order = await OrderModel.findById(orderId);
    if (!order) {
      return NextResponse.json({ received: true });
    }

    const paymentIntentId =
      typeof session.payment_intent === "string"
        ? session.payment_intent
        : session.payment_intent?.id;

    order.status = "paid";
    if (paymentIntentId) {
      order.stripePaymentIntentId = paymentIntentId;
    }
    await order.save();

    if (paymentIntentId) {
      await PaymentModel.findOneAndUpdate(
        { stripePaymentIntentId: paymentIntentId },
        {
          order: order._id,
          stripePaymentIntentId: paymentIntentId,
          amount: order.total,
          currency: "usd",
          status: "succeeded",
        },
        { upsert: true, new: true },
      );
    }

    await sendOrderConfirmationEmail({
      email: order.email,
      orderNumber: order.orderNumber,
      total: order.total,
    });
  }

  return NextResponse.json({ received: true });
}
