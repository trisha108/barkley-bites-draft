"use client";

import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";

export function SignOutButton() {
  return (
    <Button type="button" variant="outline" className="rounded-full text-xs uppercase tracking-[0.18em]" onClick={() => signOut({ callbackUrl: "/" })}>
      Log out
    </Button>
  );
}
