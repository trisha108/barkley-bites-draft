import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginGate } from "@/features/auth/login-gate";

export const metadata: Metadata = {
  title: "Sign in",
};

export default function LoginPage() {
  return (
    <Suspense>
      <LoginGate />
    </Suspense>
  );
}
