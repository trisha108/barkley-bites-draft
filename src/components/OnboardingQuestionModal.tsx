"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Question = {
  field: string;
  question: string;
  inputType: "text" | "select" | "date" | "number" | "textarea";
  options: string[] | null;
  currentValue: string | number | "";
};

const fieldCls =
  "flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

export function OnboardingQuestionModal() {
  const [question, setQuestion] = useState<Question | null>(null);
  const [value, setValue] = useState<string>("");
  const [visible, setVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch("/api/onboarding-question")
      .then((res) => res.json())
      .then((data) => {
        if (data?.question) {
          setQuestion(data.question);
          setValue(String(data.question.currentValue ?? ""));
          // Small delay so it doesn't appear instantly on page load
          setTimeout(() => setVisible(true), 800);
        }
      })
      .catch(() => {
        // Silently fail — this is a nice-to-have, never block the homepage
      });
  }, []);

  if (!question) return null;

  const close = () => setVisible(false);

  const handleSkip = async () => {
    setSubmitting(true);
    try {
      await fetch("/api/onboarding-question", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ field: question.field }),
      });
    } finally {
      setSubmitting(false);
      close();
    }
  };

  const handleSubmit = async () => {
    if (!value.trim()) {
      handleSkip();
      return;
    }
    setSubmitting(true);
    try {
      await fetch("/api/onboarding-question", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ field: question.field, value }),
      });
    } finally {
      setSubmitting(false);
      close();
    }
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          transition={{ duration: 0.25 }}
          className="glass fixed bottom-6 left-6 z-40 w-[340px] max-w-[calc(100vw-3rem)] rounded-3xl p-5 shadow-premium"
        >
          <div className="mb-3 flex items-start justify-between gap-3">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-barkley-sage">
              Quick question
            </p>
            <button
              onClick={close}
              aria-label="Dismiss"
              className="rounded-full p-1 text-muted-foreground transition hover:bg-barkley-sand/60"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          <p className="mb-4 font-display text-lg text-barkley-cocoa">{question.question}</p>

          {question.inputType === "select" && question.options ? (
            <select
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className={fieldCls}
            >
              <option value="">Select…</option>
              {question.options.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          ) : question.inputType === "textarea" ? (
            <textarea
              value={value}
              onChange={(e) => setValue(e.target.value)}
              rows={3}
              className={`${fieldCls} resize-none`}
              placeholder="Type your answer…"
            />
          ) : (
            <Input
              type={question.inputType === "date" ? "date" : question.inputType === "number" ? "number" : "text"}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="Type your answer…"
            />
          )}

          <div className="mt-4 flex items-center gap-3">
            <Button
              size="sm"
              className="flex-1 rounded-full text-xs font-semibold uppercase tracking-[0.18em]"
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? "Saving…" : "Save"}
            </Button>
            <button
              onClick={handleSkip}
              disabled={submitting}
              className="text-xs font-medium text-muted-foreground hover:text-barkley-cocoa"
            >
              Skip
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
