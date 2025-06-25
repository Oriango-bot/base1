
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { ShieldCheck } from 'lucide-react';
import { Loader2 } from 'lucide-react';
import { loginUser } from '@/app/actions';
import Footer from '@/components/footer';


export default function AdminLoginPage() {
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
      if (user.role !== 'admin' && user.role !== 'super-admin') {
        toast({
          variant: 'destructive',
          title: 'Access Denied',
          description: 'You do not have administrative privileges.',
        });
        localStorage.removeItem('loggedInUser');
        return;
      }
      
      toast({ title: 'Admin Login Successful', description: `Welcome back, ${user.name}!` });
      localStorage.setItem('loggedInUser', JSON.stringify(user));

      if (user.role === 'super-admin') {
        router.push('/super-admin/dashboard');
      } else {
        router.push('/admin/dashboard');
      }
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
       <main className="flex-1 flex items-center justify-center">
            <Card className="w-full max-w-md mx-4">
            <CardHeader className="text-center">
                <div className="flex justify-center items-center gap-2 mb-4">
                    <ShieldCheck className="h-8 w-8 text-primary" />
                    <h1 className="text-2xl font-bold">Oriango</h1>
                </div>
                <CardTitle className="text-2xl">Admin Portal</CardTitle>
                <CardDescription>Enter your credentials to access the management portal.</CardDescription>
            </CardHeader>
            <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="admin@example.com"
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
                Are you a regular user?{' '}
                <Link href="/login" className="underline">
                User Login
                </Link>
            </div>
            </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
