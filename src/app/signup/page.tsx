'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { users } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import { v4 as uuidv4 } from 'uuid';
import Link from 'next/link';
import { TrendingUp } from 'lucide-react';
import type { User, UserRole } from '@/lib/types';

export default function SignupPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (users.find((u) => u.email === email)) {
      toast({
        variant: 'destructive',
        title: 'Signup Failed',
        description: 'An account with this email already exists.',
      });
      return;
    }

    // Determine role: first user is super-admin, others are users
    const isSuperAdminPresent = users.some(u => u.role === 'super-admin');
    const role: UserRole = isSuperAdminPresent ? 'user' : 'super-admin';

    const newUser: User = {
      id: uuidv4(),
      name,
      email,
      phone,
      address,
      role,
      joinDate: new Date().toISOString(),
    };
    
    // In a real app, this would be an API call to your backend
    users.push(newUser);

    toast({ title: 'Signup Successful', description: `Welcome, ${name}! Please log in.` });
    
    // Redirect to login page after successful signup
    router.push('/login');
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
              <Input id="name" required value={name} onChange={(e) => setName(e.target.value)} />
            </div>
             <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="m@example.com" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
             <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
             <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input id="phone" type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input id="address" required value={address} onChange={(e) => setAddress(e.target.value)} />
            </div>
            <Button type="submit" className="w-full">
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
