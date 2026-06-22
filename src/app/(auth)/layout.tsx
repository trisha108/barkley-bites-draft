export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center overflow-hidden bg-gradient-to-b from-barkley-cream via-barkley-mist/40 to-barkley-sand/60 px-4 py-16">
      <div className="pointer-events-none absolute inset-x-0 -top-40 h-72 bg-[radial-gradient(circle_at_top,_rgba(107,143,113,0.35),_transparent_55%)]" />
      <div className="pointer-events-none absolute -right-10 bottom-0 h-64 w-64 rounded-full bg-barkley-clay/30 blur-3xl" />
      <div className="relative w-full max-w-md">{children}</div>
    </div>
  );
}
