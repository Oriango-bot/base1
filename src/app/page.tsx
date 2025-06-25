import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { TrendingUp, Users, CheckCircle } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-dvh bg-background">
      <header className="px-4 lg:px-6 h-16 flex items-center border-b sticky top-0 bg-background/95 backdrop-blur-sm z-10">
        <Link href="/" className="flex items-center justify-center gap-2">
          <TrendingUp className="h-6 w-6 text-primary" />
          <span className="font-semibold">Oriango</span>
        </Link>
        <nav className="ml-auto flex gap-2">
          <Button variant="ghost" asChild>
              <Link href="/login">Login</Link>
          </Button>
          <Button asChild>
              <Link href="/signup">Sign Up</Link>
          </Button>
        </nav>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 xl:gap-24">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-4">
                  <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                    Simple, Clear Micro-Finance Management
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    Oriango helps you manage loans, borrowers, and repayments with ease. Get a clear view of your micro-finance operations and empower your community.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button asChild size="lg">
                    <Link href="/dashboard">
                      Go to Dashboard
                    </Link>
                  </Button>
                </div>
              </div>
              <Image
                src="https://placehold.co/600x400.png"
                width="600"
                height="400"
                alt="Hero"
                className="mx-auto aspect-video overflow-hidden rounded-xl object-cover sm:w-full"
                data-ai-hint="finance community"
              />
            </div>
          </div>
        </section>
        
        <section className="w-full py-12 md:py-24 lg:py-32 bg-card">
            <div className="container px-4 md:px-6">
                <div className="flex flex-col items-center justify-center space-y-4 text-center">
                    <div className="space-y-3">
                        <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">Key Features</div>
                        <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Features to Empower Your Work</h2>
                        <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                            Everything you need to run a successful micro-lending service.
                        </p>
                    </div>
                </div>
                <div className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-2 md:gap-12 lg:grid-cols-3 mt-12">
                    <div className="grid gap-2 text-center">
                       <div className="mx-auto bg-primary flex items-center justify-center size-12 rounded-full mb-2">
                            <Users className="h-6 w-6 text-primary-foreground" />
                        </div>
                        <h3 className="text-lg font-bold">User Management</h3>
                        <p className="text-sm text-muted-foreground">Keep track of all your users, their profiles, and loan histories in one place.</p>
                    </div>
                     <div className="grid gap-2 text-center">
                       <div className="mx-auto bg-primary flex items-center justify-center size-12 rounded-full mb-2">
                            <TrendingUp className="h-6 w-6 text-primary-foreground" />
                        </div>
                        <h3 className="text-lg font-bold">Loan Tracking</h3>
                        <p className="text-sm text-muted-foreground">Manage loan cycles, from disbursement to full repayment, with automated status updates.</p>
                    </div>
                     <div className="grid gap-2 text-center">
                       <div className="mx-auto bg-primary flex items-center justify-center size-12 rounded-full mb-2">
                            <CheckCircle className="h-6 w-6 text-primary-foreground" />
                        </div>
                        <h3 className="text-lg font-bold">Repayment Records</h3>
                        <p className="text-sm text-muted-foreground">Easily record and view every repayment, ensuring your books are always accurate.</p>
                    </div>
                </div>
            </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
          <p className="text-xs text-muted-foreground">&copy; 2024 Oriango MicroFinance. All rights reserved.</p>
          <nav className="sm:ml-auto flex gap-4 sm:gap-6">
              <Link href="#" className="text-xs hover:underline underline-offset-4">Terms of Service</Link>
              <Link href="#" className="text-xs hover:underline underline-offset-4">Privacy</Link>
          </nav>
      </footer>
    </div>
  );
}
