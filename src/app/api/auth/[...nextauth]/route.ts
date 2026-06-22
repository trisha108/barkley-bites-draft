import type { NextRequest } from "next/server";

// Dynamic import so a missing AUTH_SECRET doesn't crash module initialisation
// and cause every /api/auth/* request to return a 404 HTML page instead of JSON.

export async function GET(request: NextRequest) {
  try {
    const { handlers } = await import("@/auth");
    return await handlers.GET(request);
  } catch {
    // AUTH_SECRET not configured — return an empty session so SessionProvider
    // doesn't receive an HTML error page and throw a ClientFetchError.
    return new Response(JSON.stringify(null), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { handlers } = await import("@/auth");
    return await handlers.POST(request);
  } catch {
    return new Response(JSON.stringify(null), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  }
}
