import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-16 md:px-6 lg:px-8">
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-barkley-sage">About</p>
      <h1 className="font-display text-4xl text-barkley-cocoa">Born in the kitchen. Scaled like a startup.</h1>
      <p className="text-sm text-muted-foreground md:text-base">
        Barkley Bites started as a single dehydrator on a Brooklyn countertop and evolved into a full-stack wellness brand
        with obsessive sourcing, transparent nutrition, and Silicon Valley-grade digital experiences.
      </p>
      <p className="text-sm text-muted-foreground md:text-base">
        Every formula is co-developed with veterinary nutritionists, stress-tested in real homes, and shipped with the care
        you&apos;d expect from a luxury house—not a big-box aisle.
      </p>
    </div>
  );
}
