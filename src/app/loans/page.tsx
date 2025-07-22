
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getLoansWithBorrowerDetails } from '@/app/actions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight } from 'lucide-react';
import { calculateOutstandingBalance, formatCurrency } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { Loan, LoanStatus } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

type LoanWithDetails = Loan & { borrowerName: string; partnerName: string };

export default function LoansPage() {
  const [loans, setLoans] = useState<LoanWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getLoansWithBorrowerDetails().then(data => {
      setLoans(data);
      setIsLoading(false);
    });
  }, []);

  const renderLoansTable = (loanList: LoanWithDetails[]) => {
    if (isLoading) {
        return (
             <div className="space-y-2 pt-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
            </div>
        )
    }

    if (loanList.length === 0) {
      return <p className="text-center text-muted-foreground py-8">No loans in this category.</p>;
    }

    return (
        <Table>
            <TableHeader>
                <TableRow>
                <TableHead>Borrower</TableHead>
                <TableHead>Partner</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead className="hidden md:table-cell">Outstanding</TableHead>
                <TableHead>
                    <span className="sr-only">Actions</span>
                </TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {loanList.map((loan) => {
                const outstanding = calculateOutstandingBalance(loan);
                return (
                    <TableRow key={loan.id}>
                    <TableCell className="font-medium">{loan.borrowerName}</TableCell>
                    <TableCell>{loan.partnerName}</TableCell>
                    <TableCell>{formatCurrency(loan.amount)}</TableCell>
                    <TableCell className="hidden md:table-cell">{formatCurrency(outstanding)}</TableCell>
                    <TableCell className="text-right">
                        <Button asChild variant="ghost" size="icon">
                        <Link href={`/loans/${loan.id}`}>
                            <ArrowRight className="h-4 w-4" />
                            <span className="sr-only">View Details</span>
                        </Link>
                        </Button>
                    </TableCell>
                    </TableRow>
                );
                })}
            </TableBody>
        </Table>
    );
  };

  const loanStatuses: LoanStatus[] = ['pending', 'approved', 'active', 'paid', 'rejected'];

  return (
    <Card>
      <CardHeader>
        <CardTitle>All Loans</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="pending" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            {loanStatuses.map(status => (
                <TabsTrigger key={status} value={status} className="capitalize">{status}</TabsTrigger>
            ))}
          </TabsList>
          {loanStatuses.map(status => (
            <TabsContent key={status} value={status}>
                {renderLoansTable(loans.filter(loan => loan.status === status))}
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
}
