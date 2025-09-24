

'use client';

import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Mail, Phone, Home, Calendar, User as UserIcon, TrendingUp } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/use-auth';

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  if (loading) {
    return (
        <div className="space-y-6">
            <Skeleton className="h-10 w-48" />
            <Card className="max-w-2xl mx-auto">
                <CardHeader>
                    <div className="flex items-center gap-4">
                        <Skeleton className="h-16 w-16 rounded-full" />
                        <div className="space-y-2">
                           <Skeleton className="h-8 w-48" />
                           <Skeleton className="h-4 w-64" />
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-full" />
                </CardContent>
            </Card>
            <Card className="max-w-2xl mx-auto">
                <CardHeader>
                     <Skeleton className="h-8 w-40" />
                </CardHeader>
                <CardContent className="flex flex-col items-center text-center">
                    <Skeleton className="h-24 w-24 rounded-full" />
                    <Skeleton className="h-6 w-32 mt-4" />
                </CardContent>
            </Card>
        </div>
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

  const getCreditScoreTier = (score: number) => {
    if (score >= 750) return { tier: 'Excellent', color: 'text-green-500' };
    if (score >= 680) return { tier: 'Good', color: 'text-blue-500' };
    if (score >= 580) return { tier: 'Fair', color: 'text-yellow-500' };
    return { tier: 'Needs Improvement', color: 'text-red-500' };
  }

  const scoreInfo = getCreditScoreTier(user.creditScore);
  const lastHistoryEntry = user.creditScoreHistory && user.creditScoreHistory.length > 0 ? user.creditScoreHistory[0] : null;

  return (
    <div className="space-y-6">
       <Button variant="outline" onClick={() => router.push(getDashboardPath())}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="max-w-2xl mx-auto lg:col-span-2">
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

        <Card className="lg:col-span-1">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="text-primary" />
                    Credit Score
                </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center text-center">
                 <div className={`text-6xl font-bold ${scoreInfo.color}`}>
                    {user.creditScore}
                </div>
                <p className={`font-semibold mt-2 ${scoreInfo.color}`}>{scoreInfo.tier}</p>
                {lastHistoryEntry && (
                   <p className="text-xs text-muted-foreground mt-1">
                    Last updated: {new Date(lastHistoryEntry.date).toLocaleDateString()}
                   </p>
                )}
            </CardContent>
        </Card>

    </div>

    </div>
  );
}

