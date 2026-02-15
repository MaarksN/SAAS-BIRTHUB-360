import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="bg-background text-foreground flex min-h-screen flex-col items-center justify-center">
      <h2 className="mb-4 text-4xl font-bold">404 - Not Found</h2>
      <p className="text-muted-foreground mb-6">
        Could not find requested resource
      </p>
      <Link
        href="/"
        className="bg-primary text-primary-foreground rounded px-4 py-2 transition-opacity hover:opacity-90"
      >
        Return Home
      </Link>
    </div>
  );
}
