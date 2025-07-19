
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Trash2, KeyRound } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import type { ApiKey } from '@/lib/types';
import { getApiKeys, updateApiKeyStatus, getNextPartnerId } from '@/app/actions';
import { format } from 'date-fns';
import CreateApiKeyDialog from '@/components/create-api-key-dialog';
import DeleteApiKeyDialog from '@/components/delete-api-key-dialog';
import { useAuth } from '@/hooks/use-auth';

export default function ApiKeysPage() {
    const { user, loading } = useAuth();
    const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [nextId, setNextId] = useState<number | null>(null);
    const { toast } = useToast();

    const fetchKeys = async () => {
        setIsLoading(true);
        try {
            const [keys, nextPartnerId] = await Promise.all([
                getApiKeys(),
                getNextPartnerId(),
            ]);
            setApiKeys(keys);
            setNextId(nextPartnerId);
        } catch (error) {
            toast({ variant: 'destructive', title: 'Failed to load data', description: 'Could not fetch API keys and next partner ID.'})
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        if (!loading && user?.role === 'super-admin') {
            fetchKeys();
        }
    }, [user, loading]);

    const handleStatusChange = async (keyId: string, currentStatus: boolean) => {
        const result = await updateApiKeyStatus(keyId, !currentStatus);
        if (result.success) {
            toast({ title: 'Status Updated', description: `API Key has been ${!currentStatus ? 'enabled' : 'disabled'}.` });
            fetchKeys(); // Re-fetch to show updated state
        } else {
            toast({ variant: 'destructive', title: 'Update Failed', description: result.error });
        }
    };
    
    if (loading) {
        return <Skeleton className="h-96 w-full" />;
    }

    if (user?.role !== 'super-admin') {
        return (
            <div className="flex items-center justify-center h-full">
                <p className="text-destructive">Access Denied. You must be a Super Admin to view this page.</p>
            </div>
        );
    }

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>API Key Management</CardTitle>
                    <CardDescription>Create, manage, and revoke API keys for external partners.</CardDescription>
                </div>
                {nextId !== null && <CreateApiKeyDialog onKeyCreated={fetchKeys} nextPartnerId={nextId} />}
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Partner</TableHead>
                            <TableHead>Key (Prefix)</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Last Used</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            Array.from({ length: 3 }).map((_, index) => (
                                <TableRow key={index}>
                                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                                    <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                                    <TableCell><Skeleton className="h-6 w-16 rounded-full" /></TableCell>
                                    <TableCell><Skeleton className="h-5 w-28" /></TableCell>
                                    <TableCell className="text-right"><Skeleton className="h-8 w-20" /></TableCell>
                                </TableRow>
                            ))
                        ) : apiKeys.length > 0 ? (
                            apiKeys.map(key => (
                                <TableRow key={key.id}>
                                    <TableCell className="font-semibold">{key.partnerName} ({key.partnerId})</TableCell>
                                    <TableCell className="font-mono text-muted-foreground">{key.key.substring(0, 15)}...</TableCell>
                                    <TableCell>
                                        <Badge variant={key.enabled ? 'default' : 'destructive'}>
                                            {key.enabled ? 'Active' : 'Revoked'}
                                        </Badge>
                                    </TableCell>
                                     <TableCell className="text-muted-foreground">
                                        {key.lastUsed ? format(new Date(key.lastUsed), 'PPpp') : 'Never'}
                                    </TableCell>
                                    <TableCell className="text-right flex items-center justify-end gap-2">
                                       <Switch
                                            checked={key.enabled}
                                            onCheckedChange={() => handleStatusChange(key.id, key.enabled)}
                                            aria-label={`Toggle API key for ${key.partnerName}`}
                                        />
                                        <DeleteApiKeyDialog apiKey={key} onKeyDeleted={fetchKeys} />
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                             <TableRow>
                                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                                    <KeyRound className="mx-auto h-12 w-12 text-gray-400" />
                                    <h3 className="mt-2 text-sm font-medium text-gray-900">No API keys found</h3>
                                    <p className="mt-1 text-sm text-gray-500">Get started by creating a new API key.</p>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}
