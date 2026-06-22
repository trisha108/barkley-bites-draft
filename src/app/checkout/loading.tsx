export default function CheckoutLoading() {
  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-10 md:px-6 lg:px-8">
      <div className="h-6 w-32 animate-pulse rounded-full bg-barkley-sand/80" />
      <div className="h-10 w-1/2 animate-pulse rounded-full bg-barkley-sand/80" />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,0.9fr)]">
        <div className="h-96 animate-pulse rounded-3xl bg-barkley-sand/60" />
        <div className="h-80 animate-pulse rounded-3xl bg-barkley-sand/60" />
      </div>
    </div>
  );
}
