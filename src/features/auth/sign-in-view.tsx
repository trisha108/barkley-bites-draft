"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { signIn } from "next-auth/react";
import { Eye, EyeOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const signInSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

const signUpSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "At least 8 characters"),
  petName: z.string().min(1, "Your dog's name helps us personalise things"),
});

type SignInValues = z.infer<typeof signInSchema>;
type SignUpValues = z.infer<typeof signUpSchema>;

export function SignInView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [tab, setTab] = useState<"signin" | "signup">("signin");
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const signInForm = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: "", password: "" },
  });

  const signUpForm = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { name: "", email: "", password: "", petName: "" },
  });

  const destination = searchParams.get("from") || "/";

  const handleSignIn = signInForm.handleSubmit(async (values) => {
    setFormError(null);
    const result = await signIn("credentials", {
      redirect: false,
      email: values.email,
      password: values.password,
    });

    if (result?.error) {
      setFormError("Incorrect email or password. Please try again.");
      return;
    }

    router.push(destination);
    router.refresh();
  });

  const handleSignUp = signUpForm.handleSubmit(async (values) => {
    setFormError(null);

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: values.name,
        email: values.email,
        password: values.password,
        petName: values.petName,
      }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => null);
      setFormError(body?.error ?? "We couldn't create your account. Please try again.");
      return;
    }

    const result = await signIn("credentials", {
      redirect: false,
      email: values.email,
      password: values.password,
    });

    if (result?.error) {
      // Account was created but sign-in failed — send them to sign in manually
      setTab("signin");
      setFormError("Account created! Please sign in below.");
      return;
    }

    router.push("/");
    router.refresh();
  });

  return (
    <div className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center overflow-hidden bg-gradient-to-b from-barkley-cream via-barkley-mist/40 to-barkley-sand/60 px-4 py-16">
      {/* decorative blobs — matches (auth)/layout.tsx exactly */}
      <div className="pointer-events-none absolute inset-x-0 -top-40 h-72 bg-[radial-gradient(circle_at_top,_rgba(107,143,113,0.35),_transparent_55%)]" />
      <div className="pointer-events-none absolute -right-10 bottom-0 h-64 w-64 rounded-full bg-barkley-clay/30 blur-3xl" />

      <div className="relative w-full max-w-md">
        <div className="glass space-y-8 rounded-3xl p-8 shadow-premium">
          {/* header */}
          <div className="space-y-2 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-barkley-sage">Welcome</p>
            <h1 className="font-display text-3xl text-barkley-cocoa">Your pack awaits</h1>
            <p className="text-sm text-muted-foreground">
              Sign in or create an account to continue.
            </p>
          </div>

          {/* tab switcher */}
          <div className="flex rounded-full bg-barkley-mist/60 p-1 text-[0.65rem] font-semibold uppercase tracking-[0.18em]">
            <button
              type="button"
              onClick={() => { setTab("signin"); setFormError(null); }}
              className={`flex-1 rounded-full py-2 transition ${
                tab === "signin"
                  ? "bg-barkley-forest text-barkley-cream shadow-soft"
                  : "text-muted-foreground hover:text-barkley-cocoa"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setTab("signup"); setFormError(null); }}
              className={`flex-1 rounded-full py-2 transition ${
                tab === "signup"
                  ? "bg-barkley-forest text-barkley-cream shadow-soft"
                  : "text-muted-foreground hover:text-barkley-cocoa"
              }`}
            >
              Create Account
            </button>
          </div>

          {formError && (
            <p className="rounded-2xl bg-destructive/10 px-4 py-2 text-center text-xs font-medium text-destructive">
              {formError}
            </p>
          )}

          <AnimatePresence mode="wait">
            {tab === "signin" ? (
              <motion.form
                key="signin"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="space-y-5"
                onSubmit={handleSignIn}
                noValidate
              >
                <div className="space-y-2">
                  <Label htmlFor="si-email">Email</Label>
                  <Input
                    id="si-email"
                    type="email"
                    autoComplete="email"
                    {...signInForm.register("email")}
                  />
                  {signInForm.formState.errors.email && (
                    <p className="text-xs text-destructive">
                      {signInForm.formState.errors.email.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="si-password">Password</Label>
                  <div className="relative">
                    <Input
                      id="si-password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      {...signInForm.register("password")}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-3 my-auto inline-flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground hover:bg-barkley-sand/80"
                      onClick={() => setShowPassword((v) => !v)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {signInForm.formState.errors.password && (
                    <p className="text-xs text-destructive">
                      {signInForm.formState.errors.password.message}
                    </p>
                  )}
                </div>

                <Button type="submit" className="w-full" disabled={signInForm.formState.isSubmitting}>
                  {signInForm.formState.isSubmitting ? "Signing in…" : "Sign In"}
                </Button>
              </motion.form>
            ) : (
              <motion.form
                key="signup"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="space-y-5"
                onSubmit={handleSignUp}
                noValidate
              >
                <div className="space-y-2">
                  <Label htmlFor="su-name">Full name</Label>
                  <Input id="su-name" autoComplete="name" {...signUpForm.register("name")} />
                  {signUpForm.formState.errors.name && (
                    <p className="text-xs text-destructive">
                      {signUpForm.formState.errors.name.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="su-email">Email</Label>
                  <Input
                    id="su-email"
                    type="email"
                    autoComplete="email"
                    {...signUpForm.register("email")}
                  />
                  {signUpForm.formState.errors.email && (
                    <p className="text-xs text-destructive">
                      {signUpForm.formState.errors.email.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="su-password">Password</Label>
                  <div className="relative">
                    <Input
                      id="su-password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      {...signUpForm.register("password")}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-3 my-auto inline-flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground hover:bg-barkley-sand/80"
                      onClick={() => setShowPassword((v) => !v)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {signUpForm.formState.errors.password && (
                    <p className="text-xs text-destructive">
                      {signUpForm.formState.errors.password.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="su-pet-name">Your dog's name</Label>
                  <Input id="su-pet-name" placeholder="e.g. Max" {...signUpForm.register("petName")} />
                  {signUpForm.formState.errors.petName && (
                    <p className="text-xs text-destructive">
                      {signUpForm.formState.errors.petName.message}
                    </p>
                  )}
                </div>

                <Button type="submit" className="w-full" disabled={signUpForm.formState.isSubmitting}>
                  {signUpForm.formState.isSubmitting ? "Creating account…" : "Create Account"}
                </Button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
