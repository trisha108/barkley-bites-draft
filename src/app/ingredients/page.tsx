import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ingredients",
};

export default function IngredientsPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-16 md:px-6 lg:px-8">
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-barkley-sage">Ingredients</p>
      <h1 className="font-display text-4xl text-barkley-cocoa">If we wouldn&apos;t feed it to our dogs, it doesn&apos;t ship.</h1>
      <p className="text-sm text-muted-foreground md:text-base">
        Traceable proteins, cold-milled botanicals, and functional ingredients at clinically meaningful doses—never
        fairy-dusting for label claims.
      </p>
      <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
        <li>MSC &amp; ASC certified seafood where applicable</li>
        <li>No artificial smoke, mystery meals, or neon dyes</li>
        <li>Lot-level testing with QR traceability on premium SKUs</li>
      </ul>
    </div>
  );
}
