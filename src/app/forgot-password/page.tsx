
'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { KeySquare, Loader2 } from 'lucide-react';
import { requestPasswordReset } from '@/app/actions';
import Footer from '@/components/footer';
import { Skeleton } from '@/components/ui/skeleton';


function ForgotPasswordForm() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const searchParams = useSearchParams();
  const loginPath = searchParams.get('from') === 'admin' ? '/admin/login' : '/login';


  const handleResetRequest = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const { success, message } = await requestPasswordReset(formData);
    
    setIsLoading(false);

    if (success) {
      toast({
        title: 'Request Received',
        description: message,
      });
    } else {
      toast({
        variant: 'destructive',
        title: 'Reset Failed',
        description: message,
      });
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
       <main className="flex-1 flex items-center justify-center">
            <Card className="w-full max-w-md mx-4">
            <CardHeader className="text-center">
                <div className="flex justify-center items-center gap-2 mb-4">
                    <KeySquare className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-2xl">Forgot Password</CardTitle>
                <CardDescription>Enter your email to reset your password.</CardDescription>
            </CardHeader>
            <CardContent>
            <form onSubmit={handleResetRequest} className="space-y-4">
                <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="m@example.com"
                    required
                    disabled={isLoading}
                />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Send Reset Instructions
                </Button>
            </form>
            <div className="mt-4 text-center text-sm">
                Remember your password?{' '}
                <Link href={loginPath} className="underline">
                Login
                </Link>
            </div>
            </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}

function LoadingSkeleton() {
    return (
        <div className="flex flex-col min-h-screen bg-background">
            <main className="flex-1 flex items-center justify-center">
                <Card className="w-full max-w-md mx-4">
                    <CardHeader className="text-center">
                        <Skeleton className="h-8 w-8 mx-auto" />
                        <Skeleton className="h-7 w-3/4 mx-auto mt-4" />
                        <Skeleton className="h-4 w-1/2 mx-auto mt-2" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-16" />
                            <Skeleton className="h-10 w-full" />
                        </div>
                        <Skeleton className="h-10 w-full" />
                        <div className="mt-4 text-center text-sm">
                            <Skeleton className="h-4 w-48 mx-auto" />
                        </div>
                    </CardContent>
                </Card>
            </main>
            <Footer />
        </div>
    );
}

export default function ForgotPasswordPage() {
    return (
        <Suspense fallback={<LoadingSkeleton />}>
            <ForgotPasswordForm />
        </Suspense>
    )
}
