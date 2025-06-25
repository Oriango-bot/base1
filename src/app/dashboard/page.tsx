
'use client';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getLoansForUser } from '@/app/actions';
import { calculateOutstandingBalance, formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Link from "next/link";
import { ArrowRight, Wallet, Landmark, CheckCircle, Clock, PiggyBank, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import type { Loan, User } from "@/lib/types";
import { Button } from "@/components/ui/button";
import LoanEligibilityCalculator from "@/components/loan-eligibility-calculator";
import { Skeleton } from '@/components/ui/skeleton';
import CreateLoanDialog from "@/components/create-loan-dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [userLoans, setUserLoans] = useState<Loan[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('loggedInUser');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      setIsLoading(true);
      getLoansForUser(parsedUser.id)
        .then(loans => {
          setUserLoans(loans.sort((a, b) => new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime()));
          setIsLoading(false);
        });
    } else {
        setIsLoading(false);
    }
  }, []);

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (!user) {
    return (
        <div className="flex items-center justify-center h-full">
            <p>Could not load user data. Please try logging in again.</p>
        </div>
    );
  }

  const activeLoans = userLoans.filter(loan => loan.status === 'active');
  const pendingLoans = userLoans.filter(loan => loan.status === 'pending');
  const paidLoans = userLoans.filter(loan => loan.status === 'paid');

  const totalOutstanding = activeLoans.reduce((acc, loan) => acc + calculateOutstandingBalance(loan), 0);
  const totalRepaid = userLoans.reduce((acc, loan) => acc + (loan.repayments.reduce((sum, p) => sum + p.amount, 0)), 0);
  
  const canApply = !userLoans.some(loan => ['pending', 'approved', 'active'].includes(loan.status));
  const activeLoanForPayment = userLoans.find(loan => loan.status === 'active');

  return (
    <div className="space-y-8">
        <div className="flex justify-between items-start">
            <h1 className="text-3xl font-bold">Welcome, {user.name}!</h1>
            <CreateLoanDialog borrowerId={user.id} canApply={canApply} />
        </div>
      
      {activeLoanForPayment && (
        <Alert variant="default" className="border-primary">
            <PiggyBank className="h-4 w-4" />
            <AlertTitle>Loan Repayment Due</AlertTitle>
            <AlertDescription>
                <p>Your outstanding balance is <strong>{formatCurrency(calculateOutstandingBalance(activeLoanForPayment))}</strong>.</p>
                <p className="mt-2 text-sm">To make a payment, use M-Pesa Paybill: <strong>12345</strong>, Account: <strong>{user.name.replace(/\s+/g, '')}</strong>.</p>
            </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Outstanding Balance</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalOutstanding)}</div>
            <p className="text-xs text-muted-foreground">Across {activeLoans.length} active loan(s)</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Repaid</CardTitle>
            <CheckCircle className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalRepaid)}</div>
             <p className="text-xs text-muted-foreground">Across all your loans</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Applications</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingLoans.length}</div>
            <p className="text-xs text-muted-foreground">Awaiting review</p>
          </CardContent>
        </Card>
         <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Loans</CardTitle>
            <Landmark className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{paidLoans.length}</div>
            <p className="text-xs text-muted-foreground">Successfully paid off</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
            <Card>
                <CardHeader>
                    <CardTitle>My Loans</CardTitle>
                    <CardDescription>An overview of your current and past loans.</CardDescription>
                </CardHeader>
                <CardContent>
                     <Table>
                        <TableHeader>
                            <TableRow>
                            <TableHead>Amount</TableHead>
                            <TableHead>Outstanding</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead><span className="sr-only">Actions</span></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {userLoans.length > 0 ? (
                            userLoans.map((loan) => (
                                <TableRow key={loan.id}>
                                <TableCell className="font-medium">{formatCurrency(loan.amount)}</TableCell>
                                <TableCell>{formatCurrency(calculateOutstandingBalance(loan))}</TableCell>
                                <TableCell>
                                    <Badge 
                                        variant={
                                            loan.status === 'active' ? 'destructive' : 
                                            loan.status === 'paid' ? 'default' :
                                            loan.status === 'rejected' ? 'destructive' :
                                            'secondary'
                                        }
                                        className="capitalize"
                                    >
                                        {loan.status}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button asChild variant="ghost" size="icon">
                                    <Link href={`/loans/${loan.id}`}>
                                        <ArrowRight className="h-4 w-4" />
                                    </Link>
                                    </Button>
                                </TableCell>
                                </TableRow>
                            ))
                            ) : (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center text-muted-foreground">
                                You have no loans.
                                </TableCell>
                            </TableRow>
                            )}
                        </TableBody>
                        </Table>
                </CardContent>
            </Card>
        </div>
        <div className="lg:col-span-1">
          <LoanEligibilityCalculator />
        </div>
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
        <Skeleton className="h-9 w-1/3" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card><CardHeader><Skeleton className="h-5 w-2/3" /></CardHeader><CardContent><Skeleton className="h-8 w-1/2" /></CardContent></Card>
            <Card><CardHeader><Skeleton className="h-5 w-2/3" /></CardHeader><CardContent><Skeleton className="h-8 w-1/2" /></CardContent></Card>
            <Card><CardHeader><Skeleton className="h-5 w-2/3" /></CardHeader><CardContent><Skeleton className="h-8 w-1/2" /></CardContent></Card>
            <Card><CardHeader><Skeleton className="h-5 w-2/3" /></CardHeader><CardContent><Skeleton className="h-8 w-1/2" /></CardContent></Card>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Card className="lg:col-span-2">
                <CardHeader>
                    <Skeleton className="h-6 w-1/4" />
                    <Skeleton className="h-4 w-2/4" />
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                </CardContent>
            </Card>
            <Card className="lg:col-span-1">
                 <CardHeader>
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                </CardHeader>
                <CardContent className="space-y-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                </CardContent>
            </Card>
        </div>
    </div>
  )
}
