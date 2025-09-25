
import DatabaseUsageCard from './database-usage-card';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Construction } from 'lucide-react';

export default function SuperAdminSettings() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <DatabaseUsageCard />
        <Card>
            <CardHeader>
                <CardTitle>System Configuration</CardTitle>
                <CardDescription>
                    Global settings for the application.
                </CardDescription>
            </CardHeader>
            <CardContent>
                 <div className="flex flex-col items-center justify-center text-center p-8 border-2 border-dashed rounded-lg h-full">
                    <Construction className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold">More Settings Coming Soon</h3>
                    <p className="text-muted-foreground text-sm">This area will contain controls for system-wide features.</p>
                </div>
            </CardContent>
        </Card>
    </div>
  );
}

