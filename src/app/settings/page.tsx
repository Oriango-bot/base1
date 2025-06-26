
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Construction } from 'lucide-react';
import type { User } from '@/lib/types';

export default function SettingsPage() {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const storedUser = localStorage.getItem('loggedInUser');
        if (storedUser) {
        setUser(JSON.parse(storedUser));
        }
        setIsLoading(false);
    }, []);

    if (isLoading) {
        return <div>Loading...</div>;
    }
    
    if (!user) {
        router.push('/login');
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
                <CardTitle>Settings</CardTitle>
                <CardDescription>Manage your account settings.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col items-center justify-center text-center p-8 border-2 border-dashed rounded-lg">
                        <Construction className="h-16 w-16 text-muted-foreground mb-4" />
                        <h3 className="text-xl font-semibold">Under Construction</h3>
                        <p className="text-muted-foreground">This page is currently being developed. Please check back later.</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
