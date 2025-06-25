
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { Loader2, ShieldCheck, ShieldAlert } from 'lucide-react';
import { signupUser, isSuperAdminPresent } from '@/app/actions';
import Footer from '@/components/footer';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminSignupPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [superAdminExists, setSuperAdminExists] = useState(true);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    async function checkSuperAdmin() {
      const present = await isSuperAdminPresent();
      setSuperAdminExists(present);
      setIsChecking(false);
    }
    checkSuperAdmin();
  }, []);

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
       toast({ title: 'Super Admin Account Created', description: `Welcome, ${user.name}! Please log in.` });
       router.push('/admin/login');
    }
  };

  if (isChecking) {
    return (
        <div className="flex flex-col min-h-screen bg-background">
            <main className="flex-1 flex items-center justify-center">
                <Card className="w-full max-w-md mx-4">
                    <CardHeader className="text-center">
                        <Skeleton className="h-8 w-8 mx-auto rounded-full" />
                        <Skeleton className="h-7 w-3/4 mx-auto mt-4" />
                        <Skeleton className="h-4 w-1/2 mx-auto mt-2" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                    </CardContent>
                </Card>
            </main>
            <Footer />
        </div>
    )
  }

  if (superAdminExists) {
    return (
       <div className="flex flex-col min-h-screen bg-background">
        <main className="flex-1 flex items-center justify-center py-8">
            <Card className="w-full max-w-md mx-4 text-center">
                 <CardHeader>
                    <div className="flex justify-center items-center gap-2 mb-4">
                        <ShieldAlert className="h-8 w-8 text-destructive" />
                    </div>
                    <CardTitle className="text-2xl">Signup Unavailable</CardTitle>
                    <CardDescription>A Super Admin account already exists in the system.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                        Only one Super Admin is permitted. Other admin accounts must be created by promoting existing users.
                    </p>
                     <Button asChild>
                        <Link href="/admin/login">
                            Go to Admin Portal
                        </Link>
                    </Button>
                </CardContent>
            </Card>
        </main>
        <Footer />
    </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
        <main className="flex-1 flex items-center justify-center py-8">
            <Card className="w-full max-w-md mx-4">
                <CardHeader className="text-center">
                    <div className="flex justify-center items-center gap-2 mb-4">
                        <ShieldCheck className="h-8 w-8 text-primary" />
                    </div>
                    <CardTitle className="text-2xl">Create Super Admin Account</CardTitle>
                    <CardDescription>This will be the primary administrative account for the system.</CardDescription>
                </CardHeader>
                <CardContent>
                <form onSubmit={handleSignup} className="space-y-4">
                    <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" name="name" required disabled={isLoading}/>
                    </div>
                    <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" name="email" type="email" placeholder="admin@example.com" required disabled={isLoading}/>
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
                    Create Account
                    </Button>
                </form>
                <div className="mt-4 text-center text-sm">
                    Are you a regular user?{' '}
                    <Link href="/login" className="underline">
                    Go to User Login
                    </Link>
                </div>
                </CardContent>
            </Card>
        </main>
        <Footer />
    </div>
  );
}
