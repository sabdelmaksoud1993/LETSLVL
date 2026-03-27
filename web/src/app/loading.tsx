export default function Loading() {
  return (
    <main className="flex min-h-[60vh] flex-col items-center justify-center">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-lvl-yellow border-t-transparent" />
      <p className="mt-4 font-display text-sm uppercase tracking-wider text-lvl-smoke">
        Loading...
      </p>
    </main>
  );
}
