import type { Metadata } from "next";
import { HomePage } from "@/features/home/home-page";

export const metadata: Metadata = {
  title: "Premium dog treats & wellness",
  description:
    "Barkley Bites is a boutique, seafood-first dog food brand—human-grade, small-batch meals made fresh weekly from rescued, local seafood. No preservatives, no fillers.",
};

export default function MarketingHome() {
  return <HomePage />;
}