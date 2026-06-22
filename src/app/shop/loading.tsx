export default function ShopLoading() {
  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-10 md:px-6 lg:px-8">
      <div className="h-6 w-40 animate-pulse rounded-full bg-barkley-sand/80" />
      <div className="h-10 w-2/3 max-w-lg animate-pulse rounded-full bg-barkley-sand/80" />
      <div className="h-12 w-full animate-pulse rounded-full bg-barkley-sand/60" />
      <div className="grid gap-4 md:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-64 animate-pulse rounded-3xl bg-barkley-sand/60" />
        ))}
      </div>
    </div>
  );
}
