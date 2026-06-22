import { NextResponse } from "next/server";
import { products } from "@/data/products";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim().toLowerCase() ?? "";
  if (!q) {
    return NextResponse.json({ suggestions: [] });
  }

  const suggestions = products
    .filter((p) => `${p.name} ${p.tagline} ${p.category}`.toLowerCase().includes(q))
    .slice(0, 6)
    .map((p) => p.name);

  return NextResponse.json({ suggestions });
}
