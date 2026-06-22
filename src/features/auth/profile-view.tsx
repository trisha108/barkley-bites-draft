"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useSession } from "next-auth/react";
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  profileSchema,
  type ProfileFormValues,
  calcAgeFromBirthday,
  emptyProfileDefaults,
  BREEDS,
} from "@/features/auth/profile-schema";

const fieldCls =
  "flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

export function ProfileView() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [mounted, setMounted] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => setMounted(true), []);

  // Redirect to / if not logged in (after session resolves so SSR stays consistent)
  useEffect(() => {
    if (mounted && status === "unauthenticated") router.replace("/");
  }, [mounted, status, router]);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: emptyProfileDefaults,
  });

  const { watch, setValue, formState: { errors } } = form;
  const birthday = watch("pet_birthday");

  // Pre-fill from the real MongoDB profile once the session is ready
  const hasPrefilled = useRef(false);
  useEffect(() => {
    if (!mounted || status !== "authenticated" || hasPrefilled.current) return;
    hasPrefilled.current = true;

    fetch("/api/profile/save")
      .then((res) => res.json())
      .then((data) => {
        if (data?.profile) {
          form.reset({ ...emptyProfileDefaults, ...data.profile });
        } else if (session?.user) {
          const [first, ...rest] = (session.user.name ?? "").split(" ");
          form.reset({
            ...emptyProfileDefaults,
            owner_first_name: first ?? "",
            owner_last_name: rest.join(" "),
            owner_email: session.user.email ?? "",
          });
        }
      })
      .catch(() => {
        // Network error — leave form at defaults, user can still fill it in
      });
  }, [mounted, status, session, form]);

  // Auto-calculate age when birthday changes
  useEffect(() => {
    if (!birthday) return;
    setValue("pet_age_years", calcAgeFromBirthday(birthday), { shouldValidate: false });
  }, [birthday, setValue]);

  const onSubmit = form.handleSubmit(async (data) => {
    try {
      await fetch("/api/profile/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 4000);
    } catch {
      // Network / DB error — silently allow retry
    }
  });

  if (!mounted || status === "loading") {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12">
        <div className="h-8 w-48 animate-pulse rounded-2xl bg-barkley-sand/40" />
      </div>
    );
  }

  if (status !== "authenticated") return null;

  return (
    <div className="mx-auto max-w-3xl space-y-10 px-4 py-12 md:px-6 lg:px-8">
      {/* Page header */}
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-barkley-sage">Account</p>
        <h1 className="font-display text-4xl text-barkley-cocoa">My Profile</h1>
        <p className="text-sm text-muted-foreground">
          Keep your details up to date. Changes save to your account.
        </p>
      </div>

      <form onSubmit={onSubmit} noValidate className="space-y-10">
        {/* ------------------------------------------------------------------ */}
        {/* Section 1 — About You                                               */}
        {/* ------------------------------------------------------------------ */}
        <section className="space-y-6 rounded-3xl bg-white/90 p-6 shadow-soft ring-1 ring-white/70 md:p-8">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-barkley-sage">Section 1</p>
            <h2 className="font-display text-2xl text-barkley-cocoa">About You</h2>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="p-owner_first_name">First name *</Label>
              <Input id="p-owner_first_name" {...form.register("owner_first_name")} />
              {errors.owner_first_name && (
                <p className="text-xs text-destructive">{errors.owner_first_name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="p-owner_last_name">Last name *</Label>
              <Input id="p-owner_last_name" {...form.register("owner_last_name")} />
              {errors.owner_last_name && (
                <p className="text-xs text-destructive">{errors.owner_last_name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="p-owner_email">Email *</Label>
              <Input id="p-owner_email" type="email" {...form.register("owner_email")} />
              {errors.owner_email && (
                <p className="text-xs text-destructive">{errors.owner_email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="p-owner_phone">Phone</Label>
              <Input
                id="p-owner_phone"
                type="tel"
                placeholder="(555) 000-0000"
                {...form.register("owner_phone")}
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="p-owner_city">City</Label>
              <Input id="p-owner_city" placeholder="Dallas" {...form.register("owner_city")} />
            </div>
          </div>
        </section>

        {/* ------------------------------------------------------------------ */}
        {/* Section 2 — About Your Pet                                          */}
        {/* ------------------------------------------------------------------ */}
        <section className="space-y-6 rounded-3xl bg-white/90 p-6 shadow-soft ring-1 ring-white/70 md:p-8">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-barkley-sage">Section 2</p>
            <h2 className="font-display text-2xl text-barkley-cocoa">About Your Pet</h2>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="p-pet_name">Pet name *</Label>
              <Input id="p-pet_name" {...form.register("pet_name")} />
              {errors.pet_name && (
                <p className="text-xs text-destructive">{errors.pet_name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="p-pet_breed">Breed *</Label>
              <select id="p-pet_breed" className={fieldCls} {...form.register("pet_breed")}>
                <option value="">Select breed…</option>
                {BREEDS.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
              {errors.pet_breed && (
                <p className="text-xs text-destructive">{errors.pet_breed.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="p-pet_birthday">Pet birthday</Label>
              <Input id="p-pet_birthday" type="date" {...form.register("pet_birthday")} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="p-pet_age_years">Age in years (if birthday unknown)</Label>
              <Input
                id="p-pet_age_years"
                type="number"
                min={0}
                max={25}
                step={0.1}
                placeholder="e.g. 3"
                {...form.register("pet_age_years")}
              />
              {errors.pet_age_years && (
                <p className="text-xs text-destructive">{errors.pet_age_years.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="p-pet_weight_lbs">Weight (lbs) *</Label>
              <Input
                id="p-pet_weight_lbs"
                type="number"
                min={1}
                max={200}
                step={0.1}
                placeholder="e.g. 45"
                {...form.register("pet_weight_lbs")}
              />
              {errors.pet_weight_lbs && (
                <p className="text-xs text-destructive">{errors.pet_weight_lbs.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="p-pet_sex">Sex</Label>
              <select id="p-pet_sex" className={fieldCls} {...form.register("pet_sex")}>
                <option value="">Select…</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Unknown">Unknown</option>
              </select>
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="p-health_conditions">Health conditions / allergies</Label>
              <textarea
                id="p-health_conditions"
                rows={3}
                className={`${fieldCls} resize-none`}
                placeholder="Optional"
                {...form.register("health_conditions")}
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="p-signup_source">How did you hear about us?</Label>
              <select id="p-signup_source" className={fieldCls} {...form.register("signup_source")}>
                <option value="">Select…</option>
                <option value="Website">Website</option>
                <option value="Instagram">Instagram</option>
                <option value="Referral">Referral</option>
                <option value="In-person">In-person</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
        </section>

        {/* Submit row + inline success message */}
        <div className="flex flex-wrap items-center gap-4">
          <Button
            type="submit"
            className="rounded-full px-10 text-xs font-semibold uppercase tracking-[0.2em]"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? "Saving…" : "Save profile"}
          </Button>

          {saved && (
            <span className="inline-flex items-center gap-2 rounded-full bg-barkley-mist/80 px-4 py-2 text-xs font-semibold text-barkley-forest ring-1 ring-barkley-sage/30">
              <CheckCircle className="h-3.5 w-3.5" />
              Profile saved
            </span>
          )}
        </div>
      </form>
    </div>
  );
}
