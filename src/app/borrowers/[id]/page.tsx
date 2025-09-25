
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getUserById, getLoansForUser } from '@/app/actions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight, Calendar, Phone, Home, Mail } from 'lucide-react';
import { calculateOutstandingBalance, formatCurrency } from '@/lib/utils';
import CreateLoanDialog from '@/components/create-loan-dialog';

export default async function UserDetailPage({ params: { id } }: { params: { id: string } }) {
  const user = await getUserById(id);
  if (!user) {
    notFound();
  }

  const userLoans = await getLoansForUser(user.id);

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      <div className="lg:col-span-1 space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>{user.name}</CardTitle>
            <CardDescription>
                <Badge variant={user.role === 'admin' || user.role === 'super-admin' ? 'secondary' : 'outline'} className="capitalize">
                    {user.role}
                </Badge>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="flex items-center gap-4 text-sm">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">{user.email}</span>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">{user.phone}</span>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <Home className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">{user.address}</span>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Joined on {new Date(user.joinDate).toLocaleDateString()}</span>
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="lg:col-span-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Loans</CardTitle>
            <CreateLoanDialog borrowerId={user.id} />
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
                        <Badge variant={loan.status === 'active' ? 'destructive' : 'default'} className="capitalize">
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
                      No loans found for this user.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
