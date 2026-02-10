import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground">
      <h2 className="text-4xl font-bold mb-4">404 - Not Found</h2>
      <p className="mb-6 text-muted-foreground">Could not find requested resource</p>
      <Link href="/" className="px-4 py-2 bg-primary text-primary-foreground rounded hover:opacity-90 transition-opacity">
        Return Home
      </Link>
    </div>
  );
}
