import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FAQ",
};

const faqs = [
  {
    q: "How is Barkley different from grocery treats?",
    a: "We formulate like a supplement brand and bake like a patisserie—small batches, premium inputs, and radical transparency.",
  },
  {
    q: "Can I pause my subscription?",
    a: "Yes. Your dashboard exposes pause, skip, cancel, and upgrade flows synced to Stripe subscription state.",
  },
  {
    q: "Do you ship cold?",
    a: "Most SKUs are shelf-stable; optional cold-chain can be enabled per SKU at checkout when available.",
  },
];

export default function FaqPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-8 px-4 py-16 md:px-6 lg:px-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-barkley-sage">FAQ</p>
        <h1 className="mt-2 font-display text-4xl text-barkley-cocoa">Answers, unsponsored.</h1>
      </div>
      <div className="space-y-4">
        {faqs.map((item) => (
          <details key={item.q} className="group rounded-3xl bg-white/90 p-4 shadow-soft ring-1 ring-white/70 open:shadow-premium">
            <summary className="cursor-pointer list-none font-medium text-barkley-cocoa">
              <span className="mr-2 text-barkley-sage">+</span>
              {item.q}
            </summary>
            <p className="mt-3 text-sm text-muted-foreground">{item.a}</p>
          </details>
        ))}
      </div>
    </div>
  );
}
