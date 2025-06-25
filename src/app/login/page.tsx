'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { TrendingUp } from 'lucide-react';
import { Loader2 } from 'lucide-react';
import { loginUser } from '@/app/actions';
import Footer from '@/components/footer';


export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const { user, error } = await loginUser(formData);
    
    setIsLoading(false);

    if (error || !user) {
      toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: error || 'An unknown error occurred.',
      });
    } else {
      toast({ title: 'Login Successful', description: `Welcome back, ${user.name}!` });
      localStorage.setItem('loggedInUser', JSON.stringify(user));

      switch (user.role) {
        case 'super-admin':
          router.push('/super-admin/dashboard');
          break;
        case 'admin':
          router.push('/admin/dashboard');
          break;
        default:
          router.push('/dashboard');
      }
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
       <main className="flex-1 flex items-center justify-center">
            <Card className="w-full max-w-md mx-4">
            <CardHeader className="text-center">
                <div className="flex justify-center items-center gap-2 mb-4">
                    <TrendingUp className="h-8 w-8 text-primary" />
                    <h1 className="text-2xl font-bold">Oriango</h1>
                </div>
                <CardTitle className="text-2xl">Login</CardTitle>
                <CardDescription>Enter your credentials to access your account</CardDescription>
            </CardHeader>
            <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
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
                <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input 
                    id="password" 
                    name="password"
                    type="password" 
                    required 
                    disabled={isLoading}
                />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Login
                </Button>
            </form>
            <div className="mt-4 text-center text-sm">
                Don&apos;t have an account?{' '}
                <Link href="/signup" className="underline">
                Sign up
                </Link>
            </div>
            </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
