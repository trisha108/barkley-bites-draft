import { pauseSubscription, resumeSubscription, skipSubscriptionDelivery, cancelSubscription } from "@/actions/subscriptions";
import { Button } from "@/components/ui/button";

type SubscriptionLite = {
  _id: string;
  planId: string;
  status: string;
  nextDeliveryAt?: string | null;
};

export function SubscriptionForms({ subscriptions }: { subscriptions: SubscriptionLite[] }) {
  if (!subscriptions.length) {
    return (
      <p className="text-sm text-muted-foreground">
        No subscriptions yet—start a plan from the{" "}
        <a className="font-semibold text-barkley-forest underline" href="/subscriptions">
          subscriptions page
        </a>{" "}
        and they&apos;ll sync here after Stripe checkout.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {subscriptions.map((sub) => (
        <div key={sub._id} className="flex flex-col gap-3 rounded-3xl bg-white/90 p-4 text-sm shadow-soft ring-1 ring-white/70 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">Plan</p>
            <p className="font-medium text-barkley-cocoa">{sub.planId}</p>
            <p className="text-xs text-muted-foreground">
              Status: <span className="font-semibold capitalize">{sub.status}</span>
            </p>
            {sub.nextDeliveryAt ? (
              <p className="text-xs text-muted-foreground">Next delivery: {new Date(sub.nextDeliveryAt).toLocaleDateString()}</p>
            ) : null}
          </div>
          <div className="flex flex-wrap gap-2">
            <form action={pauseSubscription}>
              <input type="hidden" name="subscriptionId" value={sub._id} />
              <Button type="submit" size="sm" variant="outline" className="rounded-full text-[0.65rem]">
                Pause
              </Button>
            </form>
            <form action={resumeSubscription}>
              <input type="hidden" name="subscriptionId" value={sub._id} />
              <Button type="submit" size="sm" variant="outline" className="rounded-full text-[0.65rem]">
                Resume
              </Button>
            </form>
            <form action={skipSubscriptionDelivery}>
              <input type="hidden" name="subscriptionId" value={sub._id} />
              <Button type="submit" size="sm" variant="outline" className="rounded-full text-[0.65rem]">
                Skip delivery
              </Button>
            </form>
            <form action={cancelSubscription}>
              <input type="hidden" name="subscriptionId" value={sub._id} />
              <Button type="submit" size="sm" variant="outline" className="rounded-full text-[0.65rem] text-destructive">
                Cancel
              </Button>
            </form>
          </div>
        </div>
      ))}
    </div>
  );
}
