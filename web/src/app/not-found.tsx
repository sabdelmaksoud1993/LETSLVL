import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <p className="font-display text-[8rem] leading-none font-bold text-lvl-yellow sm:text-[10rem]">
        404
      </p>
      <h1 className="mt-2 font-display text-3xl uppercase tracking-wider text-lvl-white sm:text-4xl">
        Page Not Found
      </h1>
      <p className="mt-4 max-w-md font-body text-lvl-smoke">
        The page you are looking for does not exist or has been moved.
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex items-center justify-center rounded-lg bg-lvl-yellow px-8 py-3 font-display text-sm uppercase tracking-wider text-lvl-black transition-colors hover:bg-lvl-yellow/90"
      >
        Go Home
      </Link>
    </main>
  );
}
