import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-8">
      <h1 className="text-4xl font-bold tracking-tight">Coinstack</h1>
      <p className="text-muted-foreground text-lg">Gamified personal finance education</p>
      <Button size="lg" asChild>
        <Link href="/login">Get Started</Link>
      </Button>
    </main>
  );
}
