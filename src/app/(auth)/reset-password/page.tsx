"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const schema = z
  .object({
    password: z.string().min(8, "At least 8 characters"),
    confirm: z.string().min(8, "Confirm your password"),
  })
  .refine((data) => data.password === data.confirm, {
    message: "Passwords must match",
    path: ["confirm"],
  });

type FormValues = z.infer<typeof schema>;

export default function ResetPasswordPage() {
  const router = useRouter();
  const [token, setToken] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tokenParam = params.get("token");
    if (tokenParam) setToken(tokenParam);
  }, []);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { password: "", confirm: "" },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    if (!token) {
      toast.error("Reset token is missing from the link.");
      return;
    }

    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password: values.password }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => null);
      toast.error(body?.error ?? "Unable to reset password.");
      return;
    }

    toast.success("Password updated. You can sign in now.");
    router.push("/login");
  });

  return (
    <div className="glass space-y-8 rounded-3xl p-8 shadow-premium">
      <div className="space-y-2 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-barkley-sage">Secure reset</p>
        <h1 className="font-display text-3xl text-barkley-cocoa">Choose a new password</h1>
        <p className="text-sm text-muted-foreground">Use at least 8 characters—mix letters, numbers, and symbols.</p>
      </div>

      <form className="space-y-5" onSubmit={onSubmit} noValidate>
        <div className="space-y-2 text-left">
          <Label htmlFor="password">New password</Label>
          <Input id="password" type="password" autoComplete="new-password" {...form.register("password")} />
          {form.formState.errors.password ? (
            <p className="text-xs text-destructive">{form.formState.errors.password.message}</p>
          ) : null}
        </div>
        <div className="space-y-2 text-left">
          <Label htmlFor="confirm">Confirm password</Label>
          <Input id="confirm" type="password" autoComplete="new-password" {...form.register("confirm")} />
          {form.formState.errors.confirm ? (
            <p className="text-xs text-destructive">{form.formState.errors.confirm.message}</p>
          ) : null}
        </div>
        <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Updating…" : "Update password"}
        </Button>
      </form>

      <p className="text-center text-xs text-muted-foreground">
        <Link href="/login" className="font-semibold text-barkley-forest hover:underline">
          Back to sign in
        </Link>
      </p>
    </div>
  );
}
