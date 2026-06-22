"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { MessageCircle, X, Send } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type Message = { role: "user" | "assistant"; content: string };

const GUEST_QUICK_REPLIES = [
  "What is Barkley Bites?",
  "Why seafood-first?",
  "How fresh is the food?",
  "What's in the Salmon Mix?",
];

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [quickReplies, setQuickReplies] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 300);
  }, [isOpen]);

  const initChat = useCallback(() => {
    setInitialized(true);
    setMessages([
      {
        role: "assistant",
        content:
          "Hey there! I'm Biscuit, your guide to Barkley Bites — a boutique seafood-first dog food brand right here in Dallas. What can I help you with today?",
      },
    ]);
    setQuickReplies(GUEST_QUICK_REPLIES);
  }, []);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || isLoading) return;

      setQuickReplies([]);
      const userMessage: Message = { role: "user", content: text };
      const newMessages = [...messages, userMessage];
      setMessages(newMessages);
      setInput("");
      setIsLoading(true);

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: newMessages }),
        });

        const data = await res.json();
        const rawReply: string =
          data.reply ?? "I'm having a little trouble right now — please try again!";

        const hasEscalation = rawReply.includes("[CONTACT_SCHUYLER]");
        const reply = rawReply.replace("[CONTACT_SCHUYLER]", "").trim();

        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: reply, ...(hasEscalation ? { escalate: true } : {}) } as Message,
        ]);
      } catch {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: "Connection issue — please check your internet and try again." },
        ]);
      } finally {
        setIsLoading(false);
      }
    },
    [messages, isLoading],
  );

  const toggleChat = () => {
    setIsOpen((prev) => !prev);
    if (!initialized) initChat();
  };

  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  return (
    <>
      {/* Floating bubble */}
      <button
        onClick={toggleChat}
        aria-label="Open Barkley Bites chat"
        className="fixed bottom-6 right-6 z-50 flex h-16 w-16 items-center justify-center rounded-full bg-barkley-forest text-barkley-cream shadow-premium transition hover:-translate-y-0.5 hover:shadow-xl"
      >
        {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
        {!isOpen && (
          <span className="absolute right-1 top-1 h-3 w-3 animate-pulse rounded-full border-2 border-barkley-cream bg-barkley-clay" />
        )}
      </button>

      {/* Chat window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="glass fixed bottom-24 right-6 z-50 flex h-[560px] w-[380px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-3xl shadow-premium"
          >
            {/* Header */}
            <div className="flex items-center gap-3 bg-barkley-forest px-5 py-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-lg">
                🐟
              </div>
              <div className="flex-1">
                <h2 className="font-display text-base text-barkley-cream">Biscuit</h2>
                <p className="flex items-center gap-1.5 text-xs text-barkley-cream/70">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-barkley-sage" />
                  Barkley Bites Assistant
                </p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                aria-label="Close chat"
                className="rounded-full p-1.5 text-barkley-cream/80 transition hover:bg-white/10"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 space-y-3 overflow-y-auto bg-barkley-cream/60 px-4 py-4">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-soft ${
                      msg.role === "user"
                        ? "rounded-br-sm bg-barkley-forest text-barkley-cream"
                        : "rounded-bl-sm bg-white text-barkley-cocoa"
                    }`}
                  >
                    {msg.role === "assistant" && (
                      <span className="mb-1 block text-xs font-semibold text-barkley-sage">🐠 Biscuit</span>
                    )}
                    {msg.content.split("\n").map((line, i, arr) => (
                      <span key={i}>
                        {line}
                        {i < arr.length - 1 && <br />}
                      </span>
                    ))}
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-sm bg-white px-4 py-3 shadow-soft">
                    {[0, 1, 2].map((i) => (
                      <span
                        key={i}
                        className="h-1.5 w-1.5 animate-bounce rounded-full bg-barkley-sage"
                        style={{ animationDelay: `${i * 0.15}s` }}
                      />
                    ))}
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick replies */}
            {quickReplies.length > 0 && (
              <div className="flex flex-wrap gap-2 px-4 pb-2">
                {quickReplies.map((qr) => (
                  <button
                    key={qr}
                    onClick={() => sendMessage(qr)}
                    className="rounded-full border border-barkley-sage px-3 py-1.5 text-xs font-medium text-barkley-forest transition hover:bg-barkley-sage hover:text-white"
                  >
                    {qr}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="flex items-end gap-2 border-t border-barkley-sand bg-white px-4 py-3">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder="Ask me anything about Barkley Bites..."
                rows={1}
                className="max-h-24 min-h-[42px] flex-1 resize-none rounded-xl border border-barkley-sand bg-barkley-cream/60 px-3 py-2.5 text-sm text-barkley-cocoa outline-none focus:border-barkley-sage"
              />
              <button
                onClick={() => sendMessage(input)}
                disabled={isLoading || !input.trim()}
                className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-barkley-forest text-barkley-cream transition hover:bg-barkley-sage disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Send message"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
