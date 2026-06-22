import type { Metadata } from "next";
import { LoginGate } from "@/features/auth/login-gate";

export const metadata: Metadata = {
  title: "Sign in",
};

export default function LoginPage() {
  return <LoginGate />;
}
