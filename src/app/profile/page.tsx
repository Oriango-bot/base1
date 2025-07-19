
'use client';

import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Mail, Phone, Home, Calendar, User as UserIcon } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/use-auth';

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  if (loading) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!user) {
    // AuthProvider will handle redirect
    return null;
  }
  
  const getDashboardPath = () => {
      switch (user.role) {
          case 'super-admin':
              return '/super-admin/dashboard';
          case 'admin':
              return '/admin/dashboard';
          default:
              return '/dashboard';
      }
  }

  return (
    <div className="space-y-6">
       <Button variant="outline" onClick={() => router.push(getDashboardPath())}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-muted rounded-full">
                <UserIcon className="h-8 w-8 text-primary" />
            </div>
            <div>
                <CardTitle className="text-3xl">{user.name}</CardTitle>
                <CardDescription>Your personal and contact information.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 text-lg">
          <div className="flex items-center gap-4">
            <Mail className="h-5 w-5 text-muted-foreground" />
            <span className="text-muted-foreground">{user.email}</span>
          </div>
          <div className="flex items-center gap-4">
            <Phone className="h-5 w-5 text-muted-foreground" />
            <span className="text-muted-foreground">{user.phone}</span>
          </div>
          <div className="flex items-center gap-4">
            <Home className="h-5 w-5 text-muted-foreground" />
            <span className="text-muted-foreground">{user.address}</span>
          </div>
           <div className="flex items-center gap-4">
            <Calendar className="h-5 w-5 text-muted-foreground" />
            <span className="text-muted-foreground">Joined on {new Date(user.joinDate).toLocaleDateString()}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
