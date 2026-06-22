import { redirect } from "next/navigation";
import { connectDB } from "@/lib/mongodb";
import { OrderModel } from "@/models";
import { getStripe } from "@/lib/stripe";
import { OrderConfirmationClient } from "@/features/order/order-confirmation-client";

type PageProps = {
  searchParams: Promise<{ session_id?: string }>;
};

export default async function OrderConfirmationPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  if (!sp.session_id) {
    redirect("/shop");
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    return (
      <div className="px-4 py-20 text-center text-sm text-muted-foreground">
        Stripe keys are not configured yet—set <code className="font-mono">STRIPE_SECRET_KEY</code> to test live
        checkouts.
      </div>
    );
  }

  const stripe = getStripe();
  const session = await stripe.checkout.sessions.retrieve(sp.session_id);

  await connectDB();
  let order = await OrderModel.findOne({ stripeCheckoutSessionId: sp.session_id });
  if (!order && session.metadata?.orderId) {
    order = await OrderModel.findById(session.metadata.orderId);
  }

  if (!order) {
    return (
      <div className="px-4 py-20 text-center text-sm text-muted-foreground">
        We&apos;re still syncing this order from Stripe—refresh in a few seconds.
      </div>
    );
  }

  if (session.payment_status === "paid" && order.status === "pending") {
    order.status = "paid";
    const paymentIntentId =
      typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id;
    if (paymentIntentId) {
      order.stripePaymentIntentId = paymentIntentId;
    }
    await order.save();
  }

  const serialized = JSON.parse(JSON.stringify(order));

  return <OrderConfirmationClient order={serialized} />;
}
