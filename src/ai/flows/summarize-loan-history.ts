'use server';
/**
 * @fileOverview Summarizes a loan's history and current status using AI.
 *
 * - summarizeLoanHistory - A function that handles the loan history summarization process.
 * - SummarizeLoanHistoryInput - The input type for the summarizeLoanHistory function.
 * - SummarizeLoanHistoryOutput - The return type for the summarizeLoanHistory function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeLoanHistoryInputSchema = z.object({
  loanHistory: z
    .string()
    .describe('The loan history as a string.'),
  loanStatus: z
    .string()
    .describe('The current loan status as a string.'),
});
export type SummarizeLoanHistoryInput = z.infer<typeof SummarizeLoanHistoryInputSchema>;

const SummarizeLoanHistoryOutputSchema = z.object({
  summary: z.string().describe('The summary of the loan history and status.'),
});
export type SummarizeLoanHistoryOutput = z.infer<typeof SummarizeLoanHistoryOutputSchema>;

export async function summarizeLoanHistory(input: SummarizeLoanHistoryInput): Promise<SummarizeLoanHistoryOutput> {
  return summarizeLoanHistoryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeLoanHistoryPrompt',
  input: {schema: SummarizeLoanHistoryInputSchema},
  output: {schema: SummarizeLoanHistoryOutputSchema},
  prompt: `You are an AI assistant specializing in summarizing loan histories and statuses for microfinance.

  Summarize the following loan history and status in a concise and informative manner. The summary should include key details such as the loan amount, interest rate, repayment schedule, outstanding balance, and any relevant historical transactions.

  Loan History: {{{loanHistory}}}
  Loan Status: {{{loanStatus}}}
  `,
});

const summarizeLoanHistoryFlow = ai.defineFlow(
  {
    name: 'summarizeLoanHistoryFlow',
    inputSchema: SummarizeLoanHistoryInputSchema,
    outputSchema: SummarizeLoanHistoryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
