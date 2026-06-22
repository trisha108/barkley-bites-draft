"use server";

import { auth } from "@/auth";
import { connectDB } from "@/lib/mongodb";
import { SubscriptionModel } from "@/models/Subscription";
import { z } from "zod";

const idSchema = z.object({ subscriptionId: z.string().min(1) });

async function assertOwner(subscriptionId: string, userId: string) {
  await connectDB();
  const sub = await SubscriptionModel.findById(subscriptionId);
  if (!sub || sub.user.toString() !== userId) {
    throw new Error("Subscription not found");
  }
  return sub;
}

export async function pauseSubscription(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  const parsed = idSchema.safeParse({ subscriptionId: String(formData.get("subscriptionId") ?? "") });
  if (!parsed.success) throw new Error("Invalid subscription");
  await assertOwner(parsed.data.subscriptionId, session.user.id);
  // Wire Stripe: stripe.subscriptions.update(sub.stripeSubscriptionId, { pause_collection: { behavior: "void" } })
  await SubscriptionModel.updateOne({ _id: parsed.data.subscriptionId }, { $set: { status: "paused" } });
}

export async function resumeSubscription(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  const parsed = idSchema.safeParse({ subscriptionId: String(formData.get("subscriptionId") ?? "") });
  if (!parsed.success) throw new Error("Invalid subscription");
  await assertOwner(parsed.data.subscriptionId, session.user.id);
  await SubscriptionModel.updateOne({ _id: parsed.data.subscriptionId }, { $set: { status: "active" } });
}

export async function skipSubscriptionDelivery(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  const parsed = idSchema.safeParse({ subscriptionId: String(formData.get("subscriptionId") ?? "") });
  if (!parsed.success) throw new Error("Invalid subscription");
  const sub = await assertOwner(parsed.data.subscriptionId, session.user.id);
  await SubscriptionModel.updateOne({ _id: sub._id }, { $inc: { skipCount: 1 } });
}

export async function cancelSubscription(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  const parsed = idSchema.safeParse({ subscriptionId: String(formData.get("subscriptionId") ?? "") });
  if (!parsed.success) throw new Error("Invalid subscription");
  await assertOwner(parsed.data.subscriptionId, session.user.id);
  await SubscriptionModel.updateOne({ _id: parsed.data.subscriptionId }, { $set: { status: "cancelled" } });
}
