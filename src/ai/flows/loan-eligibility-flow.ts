'use server';
/**
 * @fileOverview An AI flow to calculate loan eligibility.
 *
 * - calculateLoanEligibility - A function that handles the loan eligibility calculation process.
 * - LoanEligibilityInput - The input type for the function.
 * - LoanEligibilityOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const LoanEligibilityInputSchema = z.object({
  monthlyIncome: z.number().positive().describe("The applicant's total monthly income."),
  monthlyDebt: z.number().nonnegative().describe("The applicant's total monthly debt payments (e.g., rent, other loans)."),
  creditScore: z.number().min(300).max(850).describe("The applicant's credit score."),
  loanAmount: z.number().positive().describe('The requested loan amount.'),
});
export type LoanEligibilityInput = z.infer<typeof LoanEligibilityInputSchema>;

const LoanEligibilityOutputSchema = z.object({
  isEligible: z.boolean().describe('Whether the applicant is eligible for the loan.'),
  maxLoanAmount: z.number().describe('The maximum loan amount the applicant is eligible for.'),
  reasoning: z.string().describe('A brief explanation for the decision.'),
});
export type LoanEligibilityOutput = z.infer<typeof LoanEligibilityOutputSchema>;

export async function calculateLoanEligibility(input: LoanEligibilityInput): Promise<LoanEligibilityOutput> {
  return loanEligibilityFlow(input);
}

const prompt = ai.definePrompt({
  name: 'loanEligibilityPrompt',
  input: {schema: LoanEligibilityInputSchema},
  output: {schema: LoanEligibilityOutputSchema},
  prompt: `You are a loan officer for a microfinance institution. Your task is to assess loan eligibility based on the provided financial data.

  Applicant Data:
  - Monthly Income: KES {{{monthlyIncome}}}
  - Monthly Debt: KES {{{monthlyDebt}}}
  - Credit Score: {{{creditScore}}}
  - Requested Loan Amount: KES {{{loanAmount}}}

  Your assessment criteria:
  1.  **Debt-to-Income Ratio (DTI):** (monthlyDebt / monthlyIncome). If DTI > 0.5, the applicant is generally not eligible.
  2.  **Credit Score:**
      - 700+: Good candidate.
      - 600-699: borderline, requires more scrutiny.
      - <600: High risk, likely not eligible for large amounts.
  3.  **Affordability:** The applicant should have enough disposable income (income - debt) to comfortably make loan payments. A reasonable monthly payment should not exceed 30% of their disposable income. Assume a 10% annual interest rate and a 12-month repayment period for your calculation.
  
  Based on these criteria, determine if the applicant is eligible for the requested amount. 
  - If they are, set isEligible to true and set maxLoanAmount to the requested amount.
  - If they are not eligible for the requested amount but could be for a smaller amount, set isEligible to false, but calculate a more appropriate maxLoanAmount they could be eligible for. If they are not eligible for any amount, set maxLoanAmount to 0.
  - Provide a concise reasoning for your decision, explaining the key factors.
  `,
});

const loanEligibilityFlow = ai.defineFlow(
  {
    name: 'loanEligibilityFlow',
    inputSchema: LoanEligibilityInputSchema,
    outputSchema: LoanEligibilityOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error("The AI model did not return a valid eligibility assessment. Please try again.");
    }
    return output;
  }
);
