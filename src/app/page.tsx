

'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { FileText, FileSearch, Wallet, Menu, Zap, Repeat, HandCoins, Users } from 'lucide-react';
import Footer from '@/components/footer';
import LoanEligibilityCalculator from '@/components/loan-eligibility-calculator';

export default function HomePage() {

  return (
    <>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 xl:gap-24">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-4">
                  <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                    Financial Empowerment, Made Simple
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    Oriango provides accessible micro-loans to help you achieve your goals. Our clear process and supportive platform are here to help you grow.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button asChild size="lg">
                    <Link href="/signup">
                      Get Started
                    </Link>
                  </Button>
                   <Button asChild size="lg" variant="outline">
                    <Link href="/login">
                      Access Your Account
                    </Link>
                  </Button>
                </div>
              </div>
              <Image
                src="https://i.ibb.co/s9wSmHyn/IMG-20250626-091905-562.jpg"
                width="600"
                height="400"
                alt="Hero"
                className="mx-auto aspect-video overflow-hidden rounded-xl object-cover sm:w-full"
                data-ai-hint="finance community"
              />
            </div>
          </div>
        </section>

        <section id="about" className="w-full py-12 md:py-24 lg:py-32 bg-card">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-3">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">About Oriango</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Oriango is dedicated to providing financial empowerment through accessible and transparent micro-finance solutions. We believe in supporting local entrepreneurs and individuals to achieve their goals and build a better future. Our mission is to foster economic growth from the ground up, with a focus on community, trust, and support.
                </p>
              </div>
            </div>
          </div>
        </section>
        
        <section id="how-it-works" className="w-full py-12 md:py-24 lg:py-32 bg-background">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-3">
                <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">How It Works</div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Get Funded in Three Simple Steps</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Our process is designed to be straightforward, transparent, and fast.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-2 md:gap-12 lg:grid-cols-3 mt-12">
              <div className="grid gap-2 text-center">
                <div className="mx-auto bg-primary flex items-center justify-center size-12 rounded-full mb-2">
                  <FileText className="h-6 w-6 text-primary-foreground" />
                </div>
                <h3 className="text-lg font-bold">1. Fill Application Form</h3>
                <p className="text-sm text-muted-foreground">Fill out our simple loan application form online or through one of our trained field officers.</p>
              </div>
              <div className="grid gap-2 text-center">
                <div className="mx-auto bg-primary flex items-center justify-center size-12 rounded-full mb-2">
                  <FileSearch className="h-6 w-6 text-primary-foreground" />
                </div>
                <h3 className="text-lg font-bold">2. We Review & Approve</h3>
                <p className="text-sm text-muted-foreground">We review your application based on your hustle, history, and community backing.</p>
              </div>
              <div className="grid gap-2 text-center">
                <div className="mx-auto bg-primary flex items-center justify-center size-12 rounded-full mb-2">
                  <Wallet className="h-6 w-6 text-primary-foreground" />
                </div>
                <h3 className="text-lg font-bold">3. Receive Funds & Repay</h3>
                <p className="text-sm text-muted-foreground">Receive your funds via M-Pesa. We offer flexible weekly, bi-weekly, or monthly repayment plans.</p>
              </div>
            </div>
          </div>
        </section>

        <section id="why-choose-us" className="w-full py-12 md:py-24 lg:py-32 bg-card">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-3">
                <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">Our Promise</div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Why Choose Oriango?</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  We are committed to your financial success with a platform built on trust and simplicity.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-2 md:gap-12 lg:grid-cols-4 mt-12">
              <div className="grid gap-2 text-center">
                 <div className="mx-auto flex items-center justify-center size-12 rounded-full bg-primary/10 mb-2">
                    <Zap className="h-6 w-6 text-primary" />
                 </div>
                <h3 className="text-lg font-bold">Fast & Simple</h3>
                <p className="text-sm text-muted-foreground">Our streamlined online application takes minutes to complete.</p>
              </div>
              <div className="grid gap-2 text-center">
                <div className="mx-auto flex items-center justify-center size-12 rounded-full bg-primary/10 mb-2">
                    <Repeat className="h-6 w-6 text-primary" />
                 </div>
                <h3 className="text-lg font-bold">Flexible Repayments</h3>
                <p className="text-sm text-muted-foreground">Choose from daily, weekly, or monthly plans that fit your cash flow.</p>
              </div>
              <div className="grid gap-2 text-center">
                <div className="mx-auto flex items-center justify-center size-12 rounded-full bg-primary/10 mb-2">
                    <HandCoins className="h-6 w-6 text-primary" />
                 </div>
                <h3 className="text-lg font-bold">Transparent Fees</h3>
                <p className="text-sm text-muted-foreground">No hidden charges. Know all costs upfront before you commit.</p>
              </div>
               <div className="grid gap-2 text-center">
                <div className="mx-auto flex items-center justify-center size-12 rounded-full bg-primary/10 mb-2">
                    <Users className="h-6 w-6 text-primary" />
                 </div>
                <h3 className="text-lg font-bold">Community Focused</h3>
                <p className="text-sm text-muted-foreground">We invest in local entrepreneurs and individuals to build a stronger community.</p>
              </div>
            </div>
          </div>
        </section>

        <section id="calculator" className="w-full py-12 md:py-24 lg:py-32 bg-background">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-3">
                 <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">AI Powered</div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Check Your Eligibility</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Use our AI-powered calculator to get a quick estimate of your loan eligibility before you apply.
                </p>
              </div>
            </div>
            <div className="mx-auto max-w-2xl mt-12">
              <LoanEligibilityCalculator />
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </>
  );
}
