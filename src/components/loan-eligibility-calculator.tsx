'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { LoanEligibilityInputSchema, type LoanEligibilityOutput } from '@/ai/flows/loan-eligibility-flow';
import { checkLoanEligibility } from '@/app/actions';
import { Loader2, Sparkles, CheckCircle, XCircle } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';

type EligibilityFormValues = z.infer<typeof LoanEligibilityInputSchema>;

export default function LoanEligibilityCalculator() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<LoanEligibilityOutput | null>(null);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<EligibilityFormValues>({
    resolver: zodResolver(LoanEligibilityInputSchema),
    defaultValues: {
      monthlyIncome: 5000,
      monthlyDebt: 1500,
      creditScore: 720,
      loanAmount: 10000,
    },
  });

  const onSubmit = async (data: EligibilityFormValues) => {
    setIsLoading(true);
    setResult(null);
    setError(null);
    const response = await checkLoanEligibility(data);
    if (response.data) {
      setResult(response.data);
    } else {
      setError(response.error);
    }
    setIsLoading(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <Sparkles className="text-primary"/>
            AI Loan Eligibility Calculator
        </CardTitle>
        <CardDescription>
          Check your potential eligibility for a loan before applying.
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="monthlyIncome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Monthly Income ($)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="5000" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="monthlyDebt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Monthly Debt Payments ($)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="1500" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="creditScore"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Credit Score</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="720" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="loanAmount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Desired Loan Amount ($)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="10000" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="flex-col items-stretch gap-4">
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Check Eligibility
            </Button>
            {result && (
                 <Alert variant={result.isEligible ? "default" : "destructive"} className={result.isEligible ? 'border-green-500' : 'border-red-500'}>
                    {result.isEligible ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                    <AlertTitle>{result.isEligible ? "Eligible!" : "Not Eligible for Requested Amount"}</AlertTitle>
                    <AlertDescription>
                        <p>{result.reasoning}</p>
                        <p className="font-semibold mt-2">Max Recommended Loan: {formatCurrency(result.maxLoanAmount)}</p>
                    </AlertDescription>
                </Alert>
            )}
             {error && <Alert variant="destructive"><XCircle className="h-4 w-4" /><AlertTitle>Error</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>}
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
