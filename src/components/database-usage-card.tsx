
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { getDbStats } from '@/app/actions';
import { Skeleton } from './ui/skeleton';
import { HardDrive } from 'lucide-react';

const TOTAL_STORAGE_MB = 512;
const TOTAL_STORAGE_BYTES = TOTAL_STORAGE_MB * 1024 * 1024;

export default function DatabaseUsageCard() {
    const [stats, setStats] = useState<{dataSize: number, totalSize: number} | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        getDbStats().then(data => {
            if (!data.error) {
                setStats({dataSize: data.dataSize, totalSize: data.totalSize});
            }
            setIsLoading(false);
        });
    }, []);

    const formatBytes = (bytes: number, decimals = 2) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    };

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-1/2" />
                    <Skeleton className="h-4 w-3/4" />
                </CardHeader>
                <CardContent className="space-y-4">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-8 w-full" />
                </CardContent>
            </Card>
        )
    }

    const usagePercentage = stats ? (stats.totalSize / TOTAL_STORAGE_BYTES) * 100 : 0;

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <HardDrive />
                    Database Storage
                </CardTitle>
                <CardDescription>
                    Your current MongoDB Atlas storage usage on the free tier.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div>
                     <Progress value={usagePercentage} aria-label={`${usagePercentage.toFixed(2)}% used`} />
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                    <span>
                        Used: <span className="font-semibold text-foreground">{stats ? formatBytes(stats.totalSize) : '...'}</span>
                    </span>
                     <span>
                        Total Available: <span className="font-semibold text-foreground">{formatBytes(TOTAL_STORAGE_BYTES)}</span>
                    </span>
                </div>
            </CardContent>
        </Card>
    );
}

