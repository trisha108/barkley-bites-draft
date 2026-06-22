import type { Metadata } from "next";
import { ContactForm } from "@/features/contact/contact-form";

export const metadata: Metadata = {
  title: "Contact",
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-8 px-4 py-16 md:px-6 lg:px-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-barkley-sage">Contact</p>
        <h1 className="mt-2 font-display text-4xl text-barkley-cocoa">Talk with the Barkley concierge.</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Nutrition questions, press inquiries, or white-glove order help—this routes through Resend when configured.
        </p>
      </div>
      <ContactForm />
    </div>
  );
}
