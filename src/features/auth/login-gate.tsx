"use client";

// Middleware already redirects authenticated users away from /login before this
// renders. This component just renders the sign-in form — no client-side redirect
// needed here.
import { SignInView } from "@/features/auth/sign-in-view";

export function LoginGate() {
  return <SignInView />;
}
