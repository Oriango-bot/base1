'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { Loader2, TrendingUp } from 'lucide-react';
import type { User, UserRole } from '@/lib/types';

// This is a placeholder for a server action.
// In a real app, this would be in a separate actions file.
async function signupUser(data: FormData): Promise<{ user: any; error: string | null }> {
  'use server';
  const bcrypt = require('bcryptjs');
  const { default: clientPromise } = await import('@/lib/mongodb');
  
  const name = data.get('name') as string;
  const email = data.get('email') as string;
  const password = data.get('password') as string;
  const phone = data.get('phone') as string;
  const address = data.get('address') as string;

  if (!name || !email || !password || !phone || !address) {
    return { user: null, error: 'All fields are required.' };
  }

  try {
    const client = await clientPromise;
    const db = client.db('oriango');
    const usersCollection = db.collection('users');

    const existingUser = await usersCollection.findOne({ email });
    if (existingUser) {
      return { user: null, error: 'An account with this email already exists.' };
    }

    const isSuperAdminPresent = await usersCollection.findOne({ role: 'super-admin' });
    const role: UserRole = isSuperAdminPresent ? 'user' : 'super-admin';

    const hashedPassword = await bcrypt.hash(password, 10);
    
    const newUser: Omit<User, 'id'> = {
      name,
      email,
      password: hashedPassword,
      phone,
      address,
      role,
      joinDate: new Date().toISOString(),
    };

    const result = await usersCollection.insertOne(newUser);
    
    return { user: { id: result.insertedId.toString(), ...newUser }, error: null };
  } catch (e) {
    console.error(e);
    return { user: null, error: 'An unexpected error occurred during signup.' };
  }
}

export default function SignupPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);


  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const { user, error } = await signupUser(formData);
    
    setIsLoading(false);

    if (error || !user) {
       toast({
        variant: 'destructive',
        title: 'Signup Failed',
        description: error || 'An unknown error occurred.',
      });
    } else {
       toast({ title: 'Signup Successful', description: `Welcome, ${user.name}! Please log in.` });
       router.push('/login');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background py-8">
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="text-center">
            <div className="flex justify-center items-center gap-2 mb-4">
                <TrendingUp className="h-8 w-8 text-primary" />
                <h1 className="text-2xl font-bold">Oriango</h1>
            </div>
            <CardTitle className="text-2xl">Create an Account</CardTitle>
            <CardDescription>Enter your details to get started</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignup} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" name="name" required disabled={isLoading}/>
            </div>
             <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" placeholder="m@example.com" required disabled={isLoading}/>
            </div>
             <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" required disabled={isLoading}/>
            </div>
             <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input id="phone" name="phone" type="tel" required disabled={isLoading}/>
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input id="address" name="address" required disabled={isLoading}/>
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Sign Up
            </Button>
          </form>
           <div className="mt-4 text-center text-sm">
            Already have an account?{' '}
            <Link href="/login" className="underline">
              Login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
