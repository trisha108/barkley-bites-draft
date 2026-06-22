import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

const PUBLIC_ROUTES = ["/login"];

// Paths the proxy must never touch
function isStaticOrInternal(pathname: string): boolean {
  return (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/favicon") ||
    /\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2?|ttf|otf|eot|css|js|map)$/.test(pathname)
  );
}

export default async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (isStaticOrInternal(pathname)) return NextResponse.next();

  const token = await getToken({
    req,
    secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
  });
  const isAuthed = Boolean(token);

  // Public routes — let them through (or redirect logged-in users away from /login)
  if (PUBLIC_ROUTES.some((r) => pathname.startsWith(r))) {
    if (isAuthed && pathname.startsWith("/login")) {
      return NextResponse.redirect(new URL("/", req.nextUrl.origin));
    }
    return NextResponse.next();
  }

  // Everything else requires auth — redirect to /login if missing
  if (!isAuthed) {
    const loginUrl = new URL("/login", req.nextUrl.origin);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
};
