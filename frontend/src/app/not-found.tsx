import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="mx-auto grid min-h-dvh max-w-xl place-content-center gap-4 px-5 text-center">
      <h1 className="text-3xl font-semibold tracking-tight">Page not found</h1>
      <p className="text-muted">The page you&apos;re looking for doesn&apos;t exist or has moved.</p>
      <p>
        <Link href="/" className="text-accent underline underline-offset-4">
          Go home
        </Link>
      </p>
    </main>
  );
}
