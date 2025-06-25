'use client';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { loans as allLoans } from "@/lib/data";
import { calculateOutstandingBalance, formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Link from "next/link";
import { ArrowRight, Wallet, Landmark, CheckCircle, Clock } from "lucide-react";
import { useEffect, useState } from "react";
import type { Loan, User } from "@/lib/types";
import { Button } from "@/components/ui/button";
import LoanEligibilityCalculator from "@/components/loan-eligibility-calculator";

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [userLoans, setUserLoans] = useState<Loan[]>([]);

  useEffect(() => {
    const storedUser = localStorage.getItem('loggedInUser');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      setUserLoans(allLoans.filter(loan => loan.borrowerId === parsedUser.id));
    }
  }, []);

  if (!user) {
    return (
        <div className="flex items-center justify-center h-full">
            <p>Loading user data...</p>
        </div>
    );
  }

  const activeLoans = userLoans.filter(loan => loan.status === 'active');
  const pendingLoans = userLoans.filter(loan => loan.status === 'pending');
  const paidLoans = userLoans.filter(loan => loan.status === 'paid');

  const totalOutstanding = activeLoans.reduce((acc, loan) => acc + calculateOutstandingBalance(loan), 0);
  const totalRepaid = userLoans.reduce((acc, loan) => acc + (loan.repayments.reduce((sum, p) => sum + p.amount, 0)), 0);

  return (
    <div className="space-y-8">
        <h1 className="text-3xl font-bold">Welcome, {user.name}!</h1>
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
                                    <Badge variant={loan.status === 'active' ? 'destructive' : (loan.status === 'paid' ? 'default' : 'secondary')}>
                                        {loan.status.charAt(0).toUpperCase() + loan.status.slice(1)}
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
