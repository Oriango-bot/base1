'use client'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { users, loans } from "@/lib/data";
import { calculateOutstandingBalance, formatCurrency } from "@/lib/utils";
import { Landmark, Users, Wallet, HandCoins } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AdminDashboard() {
  const totalUsers = users.length;
  const activeLoans = loans.filter(
    (loan) => calculateOutstandingBalance(loan) > 0
  ).length;
  const totalLoaned = loans.reduce((acc, loan) => acc + loan.amount, 0);
  const totalPaid = loans.reduce(
    (acc, loan) =>
      acc + loan.repayments.reduce((sum, p) => sum + p.amount, 0),
    0
  );

  return (
    <div className="space-y-8">
       <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Users
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              All registered users
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Loans</CardTitle>
            <Landmark className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeLoans}</div>
            <p className="text-xs text-muted-foreground">
              Loans with outstanding balance
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Amount Loaned
            </CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalLoaned)}</div>
            <p className="text-xs text-muted-foreground">
              Sum of all initial loan amounts
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Repaid
            </CardTitle>
            <HandCoins className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalPaid)}</div>
            <p className="text-xs text-muted-foreground">
              Across all loans
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Admin Tools</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-4">
            <Button asChild>
                <Link href="/users">Manage Users</Link>
            </Button>
             <Button asChild variant="secondary">
                <Link href="/loans">Manage Loans</Link>
            </Button>
        </CardContent>
      </Card>
    </div>
  );
}
