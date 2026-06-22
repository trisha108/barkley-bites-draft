import type { Metadata } from "next";
import Link from "next/link";
import { subscriptionPlans } from "@/data/products";
import { formatMoney } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Subscriptions",
};

export default function SubscriptionsPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-12 px-4 py-16 md:px-6 lg:px-8">
      <div className="max-w-2xl space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-barkley-sage">Subscriptions</p>
        <h1 className="font-display text-4xl text-barkley-cocoa md:text-5xl">Never run out of the good stuff.</h1>
        <p className="text-sm text-muted-foreground md:text-base">
          Monthly rituals with concierge-level control—pause, skip, upgrade, or cancel from your Barkley dashboard. Powered
          by Stripe Billing in production.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {subscriptionPlans.map((plan) => (
          <div
            key={plan.id}
            className="flex flex-col rounded-[2rem] bg-white/90 p-6 shadow-soft ring-1 ring-white/70 transition hover:-translate-y-1 hover:shadow-premium"
          >
            <div className="flex items-center justify-between gap-2">
              <h2 className="font-display text-2xl text-barkley-cocoa">{plan.name}</h2>
              {plan.badge ? (
                <span className="rounded-full bg-barkley-forest/10 px-2 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.16em] text-barkley-forest">
                  {plan.badge}
                </span>
              ) : null}
            </div>
            <p className="mt-3 text-sm text-muted-foreground">{plan.description}</p>
            <p className="mt-6 text-3xl font-semibold">
              {formatMoney(plan.priceMonthly)}
              <span className="text-xs font-normal text-muted-foreground"> / month</span>
            </p>
            <ul className="mt-4 space-y-2 text-xs text-muted-foreground">
              {plan.perks.map((perk) => (
                <li key={perk} className="flex gap-2">
                  <span className="mt-1 h-1 w-1 rounded-full bg-barkley-sage" />
                  <span>{perk}</span>
                </li>
              ))}
            </ul>
            <div className="mt-8">
              <Link href="/checkout">
                <Button className="w-full rounded-full text-xs font-semibold uppercase tracking-[0.18em]">Start with this plan</Button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
