
'use server';

import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import type { User, Loan } from '@/lib/types';
import { getNextDueDate } from '@/lib/utils';
import { isAfter } from 'date-fns';

const MAX_SCORE = 850;
const MIN_SCORE = 300;

async function getUserCollection() {
    const client = await clientPromise;
    return client.db("oriango").collection<User>('users');
}

export async function updateUserCreditScore(userId: string, change: number, reason: string): Promise<void> {
    try {
        const usersCollection = await getUserCollection();
        const user = await usersCollection.findOne({ _id: new ObjectId(userId) });
        
        if (!user) {
            console.warn(`Credit Score Update: User ${userId} not found.`);
            return;
        }

        let currentScore = user.creditScore || 500;
        let newScore = currentScore + change;

        // Clamp the score between MIN_SCORE and MAX_SCORE
        newScore = Math.max(MIN_SCORE, Math.min(MAX_SCORE, newScore));
        
        const newHistoryEntry = {
            date: new Date().toISOString(),
            change: newScore - currentScore, // The actual change
            reason,
            newScore,
        };

        const currentHistory = user.creditScoreHistory || [];

        await usersCollection.updateOne(
            { _id: new ObjectId(userId) },
            { 
                $set: { 
                    creditScore: newScore,
                    creditScoreHistory: [newHistoryEntry, ...currentHistory].slice(0, 20) // Keep last 20 history items
                }
            }
        );

    } catch (error) {
        console.error(`Failed to update credit score for user ${userId}:`, error);
    }
}


export async function calculateRepaymentScore(loan: Loan, repaymentAmount: number): Promise<{ change: number, reason: string }> {
    const nextDueDate = getNextDueDate(loan);
    const repaymentDate = new Date();

    const totalOwed = loan.amount * (1 + loan.interestRate / 100);
    const proportionOfLoanPaid = repaymentAmount / totalOwed;

    let change = 0;
    let reason = '';

    // Logic for late payment
    if (nextDueDate && isAfter(repaymentDate, nextDueDate)) {
        change = -10; // Penalty for late payment
        reason = `Late payment on loan ${loan.formNumber.slice(-8)}.`;
    } else {
        // Base reward for any on-time payment
        change = 5; 
        reason = `On-time payment for loan ${loan.formNumber.slice(-8)}.`;

        // Bonus for significant payment amount
        if (proportionOfLoanPaid > 0.25) {
            change += 5;
            reason += ' Bonus for significant payment.';
        }
    }
    return { change, reason };
}
