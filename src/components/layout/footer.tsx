import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function Footer() {
  return (
    <footer className="mt-16 border-t border-white/40 bg-gradient-to-b from-barkley-cream to-barkley-sand/60">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4 py-12 md:flex-row md:items-start md:justify-between md:px-6 lg:px-8">
        <div className="max-w-sm space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-barkley-sage">Barkley Bites</p>
          <p className="font-display text-xl text-barkley-cocoa">Ritual-grade nutrition for modern dogs.</p>
          <p className="text-sm text-muted-foreground">
            Small-batch meals made fresh weekly from rescued, local seafood—made by hand,
            delivered with heart.
          </p>
        </div>
        <div className="grid flex-1 grid-cols-2 gap-8 text-sm md:max-w-md">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">Explore</p>
            <div className="flex flex-col gap-1 text-barkley-cocoa/80">
              <Link href="/shop" className="hover:text-barkley-forest">
                Shop all
              </Link>
              <Link href="/subscriptions" className="hover:text-barkley-forest">
                Subscriptions
              </Link>
              <Link href="/about" className="hover:text-barkley-forest">
                Our story
              </Link>
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">Support</p>
            <div className="flex flex-col gap-1 text-barkley-cocoa/80">
              <Link href="/faq" className="hover:text-barkley-forest">
                FAQ
              </Link>
              <Link href="/contact" className="hover:text-barkley-forest">
                Contact
              </Link>
              <Link href="/ingredients" className="hover:text-barkley-forest">
                Ingredients philosophy
              </Link>
            </div>
          </div>
        </div>
        <div className="w-full max-w-xs space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">Join the pack list</p>
          <p className="text-xs text-muted-foreground">Field notes, limited drops, and vet-led education—no spam, ever.</p>
          <form className="flex flex-col gap-2 sm:flex-row">
            <Input type="email" required placeholder="you@example.com" className="sm:flex-1" />
            <Button type="submit" className="sm:w-auto">
              Subscribe
            </Button>
          </form>
        </div>
      </div>
      <div className="border-t border-white/40 px-4 py-4 md:px-6 lg:px-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 text-center sm:flex-row sm:justify-between">
          <p className="text-[0.65rem] text-muted-foreground">
            © {new Date().getFullYear()} Barkley Bites. Crafted for dogs who expect more.
          </p>
          <div className="flex items-center gap-4 text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            {/* TODO: Replace with actual URL */}
            <a
              href="https://www.instagram.com/barkleybitesbowls"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-barkley-forest transition-colors"
            >
              Instagram
            </a>
            {/* TODO: Replace with actual URL */}
            <a
              href="https://www.facebook.com/barkleybitesbowls"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-barkley-forest transition-colors"
            >
              Facebook
            </a>
            {/* TODO: Replace with actual URL */}
            <a
              href="https://www.tiktok.com/@barkleybitesbowls"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-barkley-forest transition-colors"
            >
              TikTok
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
