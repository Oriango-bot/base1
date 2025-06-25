import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { Loan } from './types';
import { addWeeks, addMonths, parseISO } from 'date-fns';


export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
  }).format(amount);
}

export function calculateOutstandingBalance(loan: Loan): number {
  const totalPaid = loan.repayments.reduce((acc, p) => acc + p.amount, 0);
  const totalOwed = loan.amount * (1 + loan.interestRate / 100);
  return totalOwed - totalPaid;
}

export function getNextDueDate(loan: Loan): Date | null {
    if (calculateOutstandingBalance(loan) <= 0) {
        return null;
    }

    const lastPaymentDate = loan.repayments.length > 0
        ? parseISO(loan.repayments[loan.repayments.length - 1].date)
        : parseISO(loan.issueDate);
    
    if (loan.repaymentSchedule === 'weekly') {
        return addWeeks(lastPaymentDate, 1);
    } else {
        return addMonths(lastPaymentDate, 1);
    }
}
