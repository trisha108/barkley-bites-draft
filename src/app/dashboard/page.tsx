import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { AddressModel, OrderModel, SubscriptionModel } from "@/models";
import { formatMoney } from "@/lib/utils";
import { SignOutButton } from "@/features/account/sign-out-button";
import { SubscriptionForms } from "@/features/account/subscription-forms";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login?callbackUrl=/dashboard");
  }

  await connectDB();
  const orders = await OrderModel.find({ user: user._id }).sort({ createdAt: -1 }).limit(20).lean();
  const subscriptions = await SubscriptionModel.find({ user: user._id }).sort({ createdAt: -1 }).lean();
  const addresses = await AddressModel.find({ user: user._id }).sort({ createdAt: -1 }).lean();

  const serializedOrders = JSON.parse(JSON.stringify(orders));
  const serializedSubs = JSON.parse(JSON.stringify(subscriptions));
  const serializedAddresses = JSON.parse(JSON.stringify(addresses));

  return (
    <div className="mx-auto max-w-5xl space-y-10 px-4 py-10 md:px-6 lg:px-8">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-barkley-sage">Account</p>
          <h1 className="mt-2 font-display text-3xl text-barkley-cocoa md:text-4xl">Welcome back, {user.name}.</h1>
          <p className="mt-2 text-sm text-muted-foreground">{user.email}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/wishlist"
            className="inline-flex items-center justify-center rounded-full border border-border bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground shadow-soft hover:text-barkley-forest"
          >
            Wishlist
          </Link>
          <SignOutButton />
        </div>
      </div>

      <section className="space-y-4 rounded-3xl bg-white/90 p-6 shadow-soft ring-1 ring-white/70">
        <div className="flex items-center justify-between gap-2">
          <h2 className="font-display text-xl text-barkley-cocoa">Orders</h2>
          <Link href="/shop" className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground hover:text-barkley-forest">
            Shop again
          </Link>
        </div>
        {!serializedOrders.length ? (
          <p className="text-sm text-muted-foreground">No orders yet—your first Barkley shipment is waiting to be built.</p>
        ) : (
          <div className="space-y-3 text-sm">
            {serializedOrders.map((order: { _id: string; orderNumber: string; status: string; total: number; createdAt: string }) => (
              <div key={order._id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-barkley-mist/50 px-3 py-3">
                <div>
                  <p className="font-semibold text-barkley-cocoa">{order.orderNumber}</p>
                  <p className="text-xs text-muted-foreground">{new Date(order.createdAt).toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{order.status}</p>
                  <p className="font-semibold">{formatMoney(order.total)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-4 rounded-3xl bg-white/90 p-6 shadow-soft ring-1 ring-white/70">
        <h2 className="font-display text-xl text-barkley-cocoa">Subscriptions</h2>
        <SubscriptionForms subscriptions={serializedSubs} />
      </section>

      <section className="space-y-4 rounded-3xl bg-white/90 p-6 shadow-soft ring-1 ring-white/70">
        <h2 className="font-display text-xl text-barkley-cocoa">Saved addresses</h2>
        {!serializedAddresses.length ? (
          <p className="text-sm text-muted-foreground">
            Addresses created during checkout will appear here for faster repeat orders.
          </p>
        ) : (
          <div className="space-y-3 text-sm text-muted-foreground">
            {serializedAddresses.map(
              (addr: {
                _id: string;
                label: string;
                fullName: string;
                line1: string;
                line2?: string;
                city: string;
                state: string;
                zip: string;
                country: string;
                phone: string;
                isDefault?: boolean;
              }) => (
                <div key={addr._id} className="rounded-2xl bg-barkley-mist/50 p-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-barkley-cocoa">
                    {addr.label} {addr.isDefault ? "· Default" : ""}
                  </p>
                  <p className="font-medium text-barkley-cocoa">{addr.fullName}</p>
                  <p>
                    {addr.line1}
                    {addr.line2 ? `, ${addr.line2}` : ""}
                  </p>
                  <p>
                    {addr.city}, {addr.state} {addr.zip}
                  </p>
                  <p>{addr.country}</p>
                  <p>{addr.phone}</p>
                </div>
              ),
            )}
          </div>
        )}
      </section>
    </div>
  );
}
