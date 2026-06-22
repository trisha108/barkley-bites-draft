"use client";

import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
});

type FormValues = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "" },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    if (!res.ok) {
      toast.error("Something went wrong. Please try again.");
      return;
    }

    toast.success("If an account exists, a reset link is on the way.");
  });

  return (
    <div className="glass space-y-8 rounded-3xl p-8 shadow-premium">
      <div className="space-y-2 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-barkley-sage">Password reset</p>
        <h1 className="font-display text-3xl text-barkley-cocoa">Forgot your password?</h1>
        <p className="text-sm text-muted-foreground">
          We&apos;ll email you a secure link to reset access. Resend delivery is wired when{" "}
          <span className="font-semibold text-barkley-forest">RESEND_API_KEY</span> is configured.
        </p>
      </div>

      <form className="space-y-5" onSubmit={onSubmit} noValidate>
        <div className="space-y-2 text-left">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" autoComplete="email" {...form.register("email")} />
          {form.formState.errors.email ? (
            <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>
          ) : null}
        </div>
        <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Sending…" : "Send reset link"}
        </Button>
      </form>

      <p className="text-center text-xs text-muted-foreground">
        Remembered it?{" "}
        <Link href="/login" className="font-semibold text-barkley-forest hover:underline">
          Back to sign in
        </Link>
      </p>
    </div>
  );
}
