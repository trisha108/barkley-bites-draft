import { auth } from "@/auth";
import { NavbarClient } from "@/components/layout/navbar-client";

export async function Navbar() {
  let session = null;
  try {
    session = await auth();
  } catch {
    // AUTH_SECRET not configured — render unauthenticated navbar rather than surfacing a console error
  }
  return <NavbarClient session={session} />;
}
