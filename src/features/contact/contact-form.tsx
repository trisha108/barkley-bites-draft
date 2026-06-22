"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const schema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  topic: z.string().min(1),
  message: z.string().min(10),
});

export function ContactForm() {
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const payload = {
      name: String(formData.get("name") ?? ""),
      email: String(formData.get("email") ?? ""),
      topic: String(formData.get("topic") ?? ""),
      message: String(formData.get("message") ?? ""),
    };

    const parsed = schema.safeParse(payload);
    if (!parsed.success) {
      toast.error("Please complete all fields with a thoughtful message.");
      return;
    }

    setPending(true);
    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsed.data),
    });
    setPending(false);

    if (!res.ok) {
      toast.error("Unable to send right now—try again shortly.");
      return;
    }

    toast.success("Message sent. The Barkley concierge will reply shortly.");
    form.reset();
  }

  return (
    <form className="space-y-4 rounded-3xl bg-white/90 p-6 shadow-soft ring-1 ring-white/70" onSubmit={handleSubmit}>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input id="name" name="name" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" required />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="topic">Topic</Label>
        <select
          id="topic"
          name="topic"
          className="flex h-10 w-full rounded-full border border-input bg-white/80 px-4 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          defaultValue="orders"
        >
          <option value="orders">Orders &amp; shipping</option>
          <option value="nutrition">Nutrition &amp; ingredients</option>
          <option value="press">Press &amp; partnerships</option>
        </select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="message">Message</Label>
        <textarea
          id="message"
          name="message"
          required
          rows={5}
          className="w-full rounded-3xl border border-input bg-white/80 px-4 py-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>
      <Button type="submit" className="rounded-full text-xs font-semibold uppercase tracking-[0.18em]" disabled={pending}>
        {pending ? "Sending…" : "Send message"}
      </Button>
    </form>
  );
}
