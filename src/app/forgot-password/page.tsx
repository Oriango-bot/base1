
'use client';

import { useState } from 'react';
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';


export default function ForgotPasswordPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogContent, setDialogContent] = useState({ title: '', description: '' });
  const searchParams = useSearchParams();
  const loginPath = searchParams.get('from') === 'admin' ? '/admin/login' : '/login';


  const handleResetRequest = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const { tempPass, message, error } = await requestPasswordReset(formData);
    
    setIsLoading(false);

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Reset Failed',
        description: error,
      });
    } else if (tempPass) {
      // In a real app, this password would be emailed.
      // Here, we show it in a dialog for the prototype user.
      setDialogContent({
        title: 'Temporary Password Generated',
        description: `Your temporary password is: ${tempPass}\n\nPlease use it to log in and change your password immediately.`,
      });
      setDialogOpen(true);
    } else if (message) {
        toast({
            title: 'Request Received',
            description: message,
        })
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
       <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{dialogContent.title}</AlertDialogTitle>
            <AlertDialogDescription className="whitespace-pre-wrap">
              {dialogContent.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setDialogOpen(false)}>Close</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
