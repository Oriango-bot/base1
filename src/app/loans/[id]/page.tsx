
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { notFound, useParams } from 'next/navigation';
import { getLoanById, getUserById } from '@/app/actions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { calculateOutstandingBalance, formatCurrency, getNextDueDate } from '@/lib/utils';
import RecordRepaymentDialog from '@/components/record-repayment-dialog';
import AiSummaryDialog from '@/components/ai-summary-dialog';
import UpdateLoanStatus from '@/components/update-loan-status';
import { useAuth } from '@/hooks/use-auth';
import type { Loan, User as UserType, StatusHistoryEntry } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

type StatusHistoryWithChanger = StatusHistoryEntry & { changerName: string };

export default function LoanDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { user: currentUser, loading: authLoading } = useAuth();
  const [loan, setLoan] = useState<Loan | null>(null);
  const [user, setUser] = useState<UserType | null>(null);
  const [statusChangers, setStatusChangers] = useState<StatusHistoryWithChanger[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchLoanData() {
      setIsLoading(true);
      const fetchedLoan = await getLoanById(id);
      if (!fetchedLoan) {
        setIsLoading(false);
        notFound();
        return;
      }
      setLoan(fetchedLoan);

      const [fetchedUser, fetchedStatusChangers] = await Promise.all([
        getUserById(fetchedLoan.borrowerId),
        Promise.all(
          (fetchedLoan.statusHistory || []).map(async (h) => {
            const changer = await getUserById(h.changedBy);
            return { ...h, changerName: changer?.name || 'System' };
          })
        ),
      ]);
      
      setUser(fetchedUser);
      setStatusChangers(fetchedStatusChangers);
      setIsLoading(false);
    }
    fetchLoanData();
  }, [id]);

  if (authLoading || isLoading || !loan) {
    return (
        <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2">
                <Card>
                    <CardHeader><Skeleton className="h-8 w-1/2" /></CardHeader>
                    <CardContent><Skeleton className="h-48 w-full" /></CardContent>
                </Card>
            </div>
            <div className="lg:col-span-1 space-y-8">
                <Card>
                    <CardHeader><Skeleton className="h-8 w-3/4" /></CardHeader>
                    <CardContent><Skeleton className="h-32 w-full" /></CardContent>
                </Card>
            </div>
        </div>
    );
  }

  const isUserAdmin = currentUser?.role === 'admin' || currentUser?.role === 'super-admin';
  
  const outstandingBalance = calculateOutstandingBalance(loan);
  const totalPaid = loan.repayments.reduce((acc, p) => acc + p.amount, 0);
  const nextDueDate = getNextDueDate(loan);

  const LoanDetailsCard = (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Loan Details</CardTitle>
          <CardDescription>
            For <Link href={`/borrowers/${user?.id}`} className="text-primary hover:underline">{user?.name || 'Unknown User'}</Link>
          </CardDescription>
        </div>
        {isUserAdmin && (
            <div className="flex gap-2">
              <AiSummaryDialog loan={loan} />
              <RecordRepaymentDialog loanId={loan.id} />
            </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
            <div className="p-4 bg-muted rounded-lg">
                <div className="text-sm text-muted-foreground">Outstanding Balance</div>
                <div className="text-2xl font-bold">{formatCurrency(outstandingBalance)}</div>
            </div>
            <div className="p-4 bg-muted rounded-lg">
                <div className="text-sm text-muted-foreground">Total Paid</div>
                <div className="text-2xl font-bold">{formatCurrency(totalPaid)}</div>
            </div>
            <div className="p-4 bg-muted rounded-lg">
                <div className="text-sm text-muted-foreground">Status</div>
                 <Badge 
                    variant={
                        loan.status === 'active' ? 'destructive' : 
                        loan.status === 'paid' ? 'default' :
                        loan.status === 'rejected' ? 'destructive' :
                        'secondary'
                    }
                    className="text-lg capitalize"
                >
                    {loan.status}
                </Badge>
            </div>
            <div className="p-4 bg-muted rounded-lg">
                <div className="text-sm text-muted-foreground">Next Due Date</div>
                <div className="text-2xl font-bold">{nextDueDate ? nextDueDate.toLocaleDateString() : 'N/A'}</div>
            </div>
        </div>

        <h3 className="text-lg font-semibold mb-4">Repayment History</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loan.repayments.length > 0 ? (
              loan.repayments.map((repayment, index) => (
                <TableRow key={repayment.id || `rep-${index}`}>
                  <TableCell>{new Date(repayment.date).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">{formatCurrency(repayment.amount)}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={2} className="text-center text-muted-foreground">
                  No repayments recorded yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );

  const LoanTermsCard = (
    <Card>
      <CardHeader>
        <CardTitle>Loan Terms</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Form Number</span>
          <span className="font-medium font-mono">{loan.formNumber}</span>
        </div>
         <div className="flex justify-between">
          <span className="text-muted-foreground">Partner ID</span>
          <span className="font-medium">{loan.partnerId}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Principal Amount</span>
          <span className="font-medium">{formatCurrency(loan.amount)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Interest Rate</span>
          <span className="font-medium">{loan.interestRate}%</span>
        </div>
         <div className="flex justify-between">
          <span className="text-muted-foreground">Total with Interest</span>
          <span className="font-medium">{formatCurrency(loan.amount * (1 + loan.interestRate / 100))}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Issue Date</span>
          <span className="font-medium">{new Date(loan.issueDate).toLocaleDateString()}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Repayment Schedule</span>
          <span className="font-medium capitalize">{loan.repaymentSchedule}</span>
        </div>
      </CardContent>
    </Card>
  );

  const AdminTools = (
    <div className="space-y-8">
        <UpdateLoanStatus loan={loan} />
        <Card>
            <CardHeader><CardTitle>Status History</CardTitle></CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Status</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>By</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {statusChangers.length > 0 ? (
                            statusChangers.map((entry, index) => (
                                <TableRow key={index}>
                                    <TableCell className="capitalize">{entry.status}</TableCell>
                                    <TableCell>{new Date(entry.date).toLocaleDateString()}</TableCell>
                                    <TableCell>{entry.changerName}</TableCell>
                                </TableRow>
                            ))
                        ) : (
                             <TableRow>
                                <TableCell colSpan={3} className="text-center text-muted-foreground">
                                No status history.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    </div>
  );

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      {isUserAdmin ? (
        <>
          <div className="lg:col-span-2">{LoanDetailsCard}</div>
          <div className="lg:col-span-1 space-y-8">
            {LoanTermsCard}
            {AdminTools}
          </div>
        </>
      ) : (
        <>
          <div className="lg:col-span-2">{LoanDetailsCard}</div>
          <div className="lg:col-span-1">{LoanTermsCard}</div>
        </>
      )}
    </div>
  );
}
