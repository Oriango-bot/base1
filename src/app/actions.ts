'use server';

import { summarizeLoanHistory } from '@/ai/flows/summarize-loan-history';
import { calculateLoanEligibility, type LoanEligibilityInput } from '@/ai/flows/loan-eligibility-flow';
import type { Loan, User, UserRole } from '@/lib/types';
import { calculateOutstandingBalance, formatCurrency } from '@/lib/utils';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function getAiSummary(loanId: string) {
  try {
    const client = await clientPromise;
    const db = client.db("oriango");
    const loan = await db.collection<Loan>('loans').findOne({ _id: new ObjectId(loanId) });

    if (!loan) {
      return { summary: null, error: 'Loan not found.' };
    }

    const outstandingBalance = calculateOutstandingBalance(loan);
    const totalPaid = loan.repayments.reduce((acc, p) => acc + p.amount, 0);

    const loanHistory = loan.repayments.length > 0 
      ? loan.repayments
        .map(p => `Paid ${formatCurrency(p.amount)} on ${new Date(p.date).toLocaleDateString()}.`)
        .join('\n')
      : 'No repayment history yet.';
      
    const totalOwed = loan.amount * (1 + loan.interestRate / 100);

    const loanStatus = `
      Principal Amount: ${formatCurrency(loan.amount)}.
      Interest Rate: ${loan.interestRate}%.
      Total Owed: ${formatCurrency(totalOwed)}.
      Outstanding Balance: ${formatCurrency(outstandingBalance)}.
      Total Paid: ${formatCurrency(totalPaid)}.
      Current Status: ${outstandingBalance > 0 ? 'Active' : 'Paid Off'}.
    `;

    const result = await summarizeLoanHistory({
      loanHistory,
      loanStatus,
    });
    
    return { summary: result.summary, error: null };
  } catch (error) {
    console.error('Error getting AI summary:', error);
    return { summary: null, error: 'Failed to generate summary. Please try again.' };
  }
}

export async function checkLoanEligibility(input: LoanEligibilityInput) {
  try {
    const result = await calculateLoanEligibility(input);
    return { data: result, error: null };
  } catch (error) {
    console.error('Error checking loan eligibility:', error);
    return { data: null, error: 'Failed to check eligibility. Please try again.' };
  }
}

export async function updateUserRole(userId: string, newRole: UserRole) {
  try {
    const client = await clientPromise;
    const db = client.db("oriango");
    const result = await db.collection('users').updateOne(
      { _id: new ObjectId(userId) },
      { $set: { role: newRole } }
    );
    if (result.modifiedCount === 0) throw new Error("User not found or role is already set.");
    return { success: true };
  } catch (error) {
    console.error("Failed to update role:", error);
    return { success: false, error: (error as Error).message };
  }
}
