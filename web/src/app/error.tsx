"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[error boundary]", error);
  }, [error]);
  return (
    <main className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <p className="font-display text-[6rem] leading-none font-bold text-lvl-yellow sm:text-[8rem]">
        !
      </p>
      <h1 className="mt-2 font-display text-3xl uppercase tracking-wider text-lvl-white sm:text-4xl">
        Something Went Wrong
      </h1>
      <p className="mt-4 max-w-md font-body text-lvl-smoke">
        An unexpected error occurred. Please try again or return to the home page.
      </p>
      <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row">
        <button
          type="button"
          onClick={reset}
          className="inline-flex items-center justify-center rounded-lg bg-lvl-yellow px-8 py-3 font-display text-sm uppercase tracking-wider text-lvl-black transition-colors hover:bg-lvl-yellow/90"
        >
          Try Again
        </button>
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-lg border border-lvl-slate px-8 py-3 font-display text-sm uppercase tracking-wider text-lvl-white transition-colors hover:border-lvl-smoke"
        >
          Go Home
        </Link>
      </div>
    </main>
  );
}
