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

// This is a placeholder for a server action.
// In a real app, this would be in a separate actions file.
async function loginUser(data: FormData): Promise<{ user: any; error: string | null }> {
  'use server';
  const bcrypt = require('bcryptjs');
  const { default: clientPromise } = await import('@/lib/mongodb');
  
  const email = data.get('email') as string;
  const password = data.get('password') as string;

  if (!email || !password) {
    return { user: null, error: 'Email and password are required.' };
  }

  try {
    const client = await clientPromise;
    const db = client.db('oriango');
    const user = await db.collection('users').findOne({ email });

    if (!user) {
      return { user: null, error: 'Invalid email or password.' };
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return { user: null, error: 'Invalid email or password.' };
    }
    
    // Don't send password hash to client
    const { password: _, ...userWithoutPassword } = user;
    const finalUser = { ...userWithoutPassword, id: user._id.toString() };

    return { user: finalUser, error: null };
  } catch (e) {
    console.error(e);
    return { user: null, error: 'An unexpected error occurred.' };
  }
}


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
    <div className="flex items-center justify-center min-h-screen bg-background">
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
    </div>
  );
}
