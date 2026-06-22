import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center gap-4 px-4 py-24 text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-barkley-sage">404</p>
      <h1 className="font-display text-4xl text-barkley-cocoa">This page wandered off-leash.</h1>
      <p className="text-sm text-muted-foreground">
        The URL may have changed, or the treat you&apos;re hunting moved collections. Let&apos;s get you back to something
        delicious.
      </p>
      <div className="flex flex-wrap justify-center gap-3 pt-2">
        <Link href="/">
          <Button className="rounded-full px-8 text-xs font-semibold uppercase tracking-[0.2em]">Home</Button>
        </Link>
        <Link href="/shop">
          <Button variant="outline" className="rounded-full px-8 text-xs font-semibold uppercase tracking-[0.2em]">
            Shop
          </Button>
        </Link>
      </div>
    </div>
  );
}
