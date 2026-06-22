"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useSession } from "next-auth/react";
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

// Re-export schema + type so consumers can import from one place
export { profileSchema, type ProfileFormValues } from "@/features/auth/profile-schema";

const fieldCls =
  "flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

export function RegisterView() {
  const router = useRouter();
  const { data: session } = useSession();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: emptyProfileDefaults,
  });

  const { watch, setValue, formState: { errors } } = form;
  const birthday = watch("pet_birthday");

  // Pre-fill name/email from the real session once available
  const hasPrefilled = useRef(false);
  useEffect(() => {
    if (session?.user && !hasPrefilled.current) {
      hasPrefilled.current = true;
      const [first, ...rest] = (session.user.name ?? "").split(" ");
      form.reset({
        ...emptyProfileDefaults,
        owner_first_name: first ?? "",
        owner_last_name: rest.join(" "),
        owner_email: session.user.email ?? "",
      });
    }
  }, [session, form]);

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
    } catch {
      // Network / DB error — still proceed, user can update later from account page
    }
    router.push("/");
  });

  const handleSkip = () => {
    router.push("/");
  };

  return (
    <div className="mx-auto max-w-3xl space-y-10 px-4 py-12 md:px-6 lg:px-8">
      {/* Page header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-barkley-sage">
            Account setup
          </p>
          <h1 className="font-display text-4xl text-barkley-cocoa">Tell us about yourself</h1>
          <p className="text-sm text-muted-foreground">
            This helps us personalise your experience. All pet fields marked optional can be skipped.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          className="shrink-0 rounded-full px-6 text-xs font-semibold uppercase tracking-[0.18em]"
          onClick={handleSkip}
        >
          Skip for now
        </Button>
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
              <Label htmlFor="owner_first_name">First name *</Label>
              <Input id="owner_first_name" {...form.register("owner_first_name")} />
              {errors.owner_first_name && (
                <p className="text-xs text-destructive">{errors.owner_first_name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="owner_last_name">Last name *</Label>
              <Input id="owner_last_name" {...form.register("owner_last_name")} />
              {errors.owner_last_name && (
                <p className="text-xs text-destructive">{errors.owner_last_name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="owner_email">Email *</Label>
              <Input id="owner_email" type="email" autoComplete="email" {...form.register("owner_email")} />
              {errors.owner_email && (
                <p className="text-xs text-destructive">{errors.owner_email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="owner_phone">Phone</Label>
              <Input
                id="owner_phone"
                type="tel"
                autoComplete="tel"
                placeholder="(555) 000-0000"
                {...form.register("owner_phone")}
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="owner_city">City</Label>
              <Input id="owner_city" placeholder="Dallas" {...form.register("owner_city")} />
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
              <Label htmlFor="pet_name">Pet name *</Label>
              <Input id="pet_name" {...form.register("pet_name")} />
              {errors.pet_name && (
                <p className="text-xs text-destructive">{errors.pet_name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="pet_breed">Breed *</Label>
              <select id="pet_breed" className={fieldCls} {...form.register("pet_breed")}>
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
              <Label htmlFor="pet_birthday">Pet birthday</Label>
              <Input id="pet_birthday" type="date" {...form.register("pet_birthday")} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="pet_age_years">Age in years (if birthday unknown)</Label>
              <Input
                id="pet_age_years"
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
              <Label htmlFor="pet_weight_lbs">Weight (lbs) *</Label>
              <Input
                id="pet_weight_lbs"
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
              <Label htmlFor="pet_sex">Sex</Label>
              <select id="pet_sex" className={fieldCls} {...form.register("pet_sex")}>
                <option value="">Select…</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Unknown">Unknown</option>
              </select>
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="health_conditions">Health conditions / allergies</Label>
              <textarea
                id="health_conditions"
                rows={3}
                className={`${fieldCls} resize-none`}
                placeholder="Optional"
                {...form.register("health_conditions")}
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="signup_source">How did you hear about us?</Label>
              <select id="signup_source" className={fieldCls} {...form.register("signup_source")}>
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

        {/* Submit row */}
        <div className="flex flex-wrap items-center gap-4">
          <Button
            type="submit"
            className="rounded-full px-10 text-xs font-semibold uppercase tracking-[0.2em]"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? "Saving…" : "Complete setup"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="rounded-full text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground"
            onClick={handleSkip}
          >
            Skip for now
          </Button>
        </div>
      </form>
    </div>
  );
}
