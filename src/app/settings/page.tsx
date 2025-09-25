

'use client';

import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { Skeleton } from '@/components/ui/skeleton';
import SuperAdminSettings from '@/components/super-admin-system-settings';
import UserAppearanceSettings from '@/components/user-appearance-settings';

export default function SettingsPage() {
    const { user, loading } = useAuth();
    const router = useRouter();

    if (loading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-10 w-48" />
                <Skeleton className="h-64 w-full" />
                <Skeleton className="h-64 w-full" />
            </div>
        );
    }
    
    if (!user) {
        // AuthProvider will redirect
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
            <Card>
                <CardHeader>
                <CardTitle>Settings</CardTitle>
                <CardDescription>Manage your account and application settings.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                  {user.role === 'super-admin' && (
                    <SuperAdminSettings />
                  )}
                   {(user.role === 'user' || user.role === 'admin') && (
                    <UserAppearanceSettings />
                  )}
                </CardContent>
            </Card>
        </div>
    );
}
