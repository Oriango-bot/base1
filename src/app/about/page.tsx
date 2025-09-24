

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Footer from '@/components/footer';
import { OriangoLogo } from '@/components/oriango-logo';

export default function AboutUsPage() {
  return (
    <>
      <div className="container mx-auto py-12 px-4 md:px-6">
        <div className="mb-8">
            <Button asChild variant="outline">
              <Link href="/">
                  <ArrowLeft className="mr-2 h-4 w-4"/>
                  Back to Home
              </Link>
            </Button>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>About Oriango MicroFinance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-lg text-muted-foreground">
            <p>
              Oriango is dedicated to providing financial empowerment through accessible and transparent micro-finance solutions. We believe in supporting local entrepreneurs and individuals to achieve their goals and build a better future. 
            </p>
            <p>
              Our mission is to foster economic growth from the ground up, with a focus on community, trust, and support. We leverage technology to create a clear, simple, and efficient money lending system that puts the power back in your hands.
            </p>
            <p>
              Whether you're looking to expand your business, cover an emergency expense, or invest in your future, Oriango provides a reliable and supportive platform to help you on your journey. Our process is designed to be straightforward and fast, ensuring you get the funds you need when you need them.
            </p>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </>
  );
}

