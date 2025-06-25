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

export default async function FormSeriesPage() {
    const series = await getFormSeries();

    return (
        <Card>
            <CardHeader>
                <CardTitle>Form Series Registry</CardTitle>
                <CardDescription>Manage form number validation rules for all partners.</CardDescription>
            </CardHeader>
            <CardContent>
                {/* TODO: Add "New Series" Dialog */}
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Partner ID</TableHead>
                            <TableHead>Prefix</TableHead>
                            <TableHead>Range</TableHead>
                            <TableHead>Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {series.length > 0 ? (
                            series.map((s) => (
                                <TableRow key={s.id}>
                                    <TableCell className="font-semibold">{s.partner_id}</TableCell>
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
