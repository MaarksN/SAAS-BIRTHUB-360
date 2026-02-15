import Link from 'next/link';
import { Button } from '@salesos/ui';
import { FileQuestion } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-4 text-center bg-background text-foreground">
      <div className="rounded-full bg-muted p-6 animate-in zoom-in duration-300">
        <FileQuestion className="h-16 w-16 text-muted-foreground" />
      </div>
      <div className="space-y-2 animate-in slide-in-from-bottom-4 duration-500 delay-100">
        <h2 className="text-4xl font-extrabold tracking-tight sm:text-5xl">404</h2>
        <p className="text-2xl font-semibold text-muted-foreground">Page Not Found</p>
        <p className="max-w-[500px] text-muted-foreground md:text-lg mx-auto">
          Sorry, we couldn't find the page you're looking for. It might have been removed or doesn't exist.
        </p>
      </div>
      <div className="animate-in slide-in-from-bottom-4 duration-500 delay-200">
        <Link href="/">
          <Button size="lg" variant="primary">Return Home</Button>
        </Link>
      </div>
    </div>
  );
}
