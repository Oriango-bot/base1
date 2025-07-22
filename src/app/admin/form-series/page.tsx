'use client';

import { useState, useEffect } from 'react';
import { getFormSeries } from '@/app/actions';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import type { FormSeries, User } from '@/lib/types';
import AddFormSeriesDialog from '@/components/add-form-series-dialog';

type FormSeriesWithPartner = FormSeries & { partnerName: string };

export default function FormSeriesPage() {
    const [series, setSeries] = useState<FormSeriesWithPartner[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState<User | null>(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('loggedInUser');
        if (storedUser) {
          setCurrentUser(JSON.parse(storedUser));
        }

        getFormSeries().then(data => {
            setSeries(data);
            setIsLoading(false);
        });
    }, []);

    const handleSeriesAdded = () => {
        setIsLoading(true);
        getFormSeries().then(data => {
            setSeries(data);
            setIsLoading(false);
        });
    };

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Form Series Registry</CardTitle>
                    <CardDescription>Manage form number validation rules for all partners.</CardDescription>
                </div>
                {currentUser?.role === 'super-admin' && <AddFormSeriesDialog onSeriesAdded={handleSeriesAdded} />}
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Partner</TableHead>
                            <TableHead>Prefix</TableHead>
                            <TableHead>Range</TableHead>
                            <TableHead>Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <>
                                <TableRow>
                                    <TableCell colSpan={4}>
                                        <Skeleton className="h-8 w-full" />
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell colSpan={4}>
                                        <Skeleton className="h-8 w-full" />
                                    </TableCell>
                                </TableRow>
                            </>
                        ) : series.length > 0 ? (
                            series.map((s) => (
                                <TableRow key={s.id}>
                                    <TableCell className="font-semibold">{s.partnerName} ({s.partner_id})</TableCell>
                                    <TableCell className="font-mono text-muted-foreground">{s.prefix}</TableCell>
                                    <TableCell className="font-mono text-muted-foreground">{s.start_number} - {s.end_number}</TableCell>
                                    <TableCell>
                                        <Badge 
                                            variant={s.status === 'active' 
                                                ? 'default' 
                                                : (s.status === 'revoked' ? 'destructive' : 'secondary')}
                                            className="capitalize"
                                        >
                                            {s.status}
                                        </Badge>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center text-muted-foreground">
                                    No form series defined.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}
