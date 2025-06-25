import Link from 'next/link';
import { borrowers, loans } from '@/lib/data';
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
import { calculateOutstandingBalance, formatCurrency, getNextDueDate } from '@/lib/utils';

export default function LoansPage() {
  const allLoans = loans.map(loan => {
    const borrower = borrowers.find(b => b.id === loan.borrowerId);
    return { ...loan, borrowerName: borrower?.name || 'Unknown' };
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>All Loans</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Borrower</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead className="hidden md:table-cell">Outstanding</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden sm:table-cell">Next Due Date</TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {allLoans.map((loan) => {
              const outstanding = calculateOutstandingBalance(loan);
              const nextDueDate = getNextDueDate(loan);
              return (
                <TableRow key={loan.id}>
                  <TableCell className="font-medium">{loan.borrowerName}</TableCell>
                  <TableCell>{formatCurrency(loan.amount)}</TableCell>
                  <TableCell className="hidden md:table-cell">{formatCurrency(outstanding)}</TableCell>
                  <TableCell>
                    <Badge variant={outstanding > 0 ? 'destructive' : 'default'}>
                      {outstanding > 0 ? 'Active' : 'Paid'}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell text-muted-foreground">
                    {nextDueDate ? nextDueDate.toLocaleDateString() : 'N/A'}
                  </TableCell>
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
      </CardContent>
    </Card>
  );
}
