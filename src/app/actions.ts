
'use server';

import { summarizeLoanHistory } from '@/ai/flows/summarize-loan-history';
import { calculateLoanEligibility, type LoanEligibilityInput } from '@/ai/flows/loan-eligibility-flow';
import type { Loan, User, UserRole } from '@/lib/types';
import { calculateOutstandingBalance, formatCurrency } from '@/lib/utils';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import bcrypt from 'bcryptjs';

// --- Utility function to map MongoDB documents ---
function mapMongoId<T extends { _id: ObjectId }>(doc: T): Omit<T, '_id'> & { id: string } {
  const { _id, ...rest } = doc;
  return { ...rest, id: _id.toString() };
}

// --- User Actions ---

export async function getUsers(): Promise<User[]> {
  try {
    const client = await clientPromise;
    const db = client.db("oriango");
    const users = await db.collection('users').find({}).toArray();
    return users.map(user => mapMongoId(user)) as User[];
  } catch (error) {
    console.error("Failed to get users:", error);
    return [];
  }
}

export async function getUserById(userId: string): Promise<User | null> {
  try {
    const client = await clientPromise;
    const db = client.db("oriango");
    const user = await db.collection('users').findOne({ _id: new ObjectId(userId) });
    return user ? mapMongoId(user) as User : null;
  } catch (error) {
    console.error(`Failed to get user ${userId}:`, error);
    return null;
  }
}

export async function loginUser(data: FormData): Promise<{ user: User; error: string | null }> {
  const email = data.get('email') as string;
  const password = data.get('password') as string;

  if (!email || !password) {
    return { user: null, error: 'Email and password are required.' };
  }

  try {
    const client = await clientPromise;
    const db = client.db('oriango');
    const user = await db.collection('users').findOne({ email });

    if (!user) {
      return { user: null, error: 'Invalid email or password.' };
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return { user: null, error: 'Invalid email or password.' };
    }
    
    return { user: mapMongoId(user) as User, error: null };
  } catch (e) {
    console.error(e);
    return { user: null, error: 'An unexpected error occurred.' };
  }
}

export async function signupUser(data: FormData): Promise<{ user: User; error: string | null }> {
  const name = data.get('name') as string;
  const email = data.get('email') as string;
  const password = data.get('password') as string;
  const phone = data.get('phone') as string;
  const address = data.get('address') as string;

  if (!name || !email || !password || !phone || !address) {
    return { user: null, error: 'All fields are required.' };
  }

  try {
    const client = await clientPromise;
    const db = client.db('oriango');
    const usersCollection = db.collection('users');

    const existingUser = await usersCollection.findOne({ email });
    if (existingUser) {
      return { user: null, error: 'An account with this email already exists.' };
    }

    const isSuperAdminPresent = await usersCollection.findOne({ role: 'super-admin' });
    const role: UserRole = isSuperAdminPresent ? 'user' : 'super-admin';

    const hashedPassword = await bcrypt.hash(password, 10);
    
    const newUserDoc = {
      name,
      email,
      password: hashedPassword,
      phone,
      address,
      role,
      joinDate: new Date().toISOString(),
    };

    const result = await usersCollection.insertOne(newUserDoc);
    
    const finalUser = {
      ...newUserDoc,
      id: result.insertedId.toString(),
    };
    // @ts-ignore
    delete finalUser.password;
    
    return { user: finalUser as User, error: null };
  } catch (e) {
    console.error(e);
    return { user: null, error: 'An unexpected error occurred during signup.' };
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

// --- Loan Actions ---

export async function getLoanById(loanId: string): Promise<Loan | null> {
    try {
        const client = await clientPromise;
        const db = client.db("oriango");
        const loan = await db.collection('loans').findOne({ _id: new ObjectId(loanId) });
        return loan ? mapMongoId(loan) as Loan : null;
    } catch (error) {
        console.error(`Failed to get loan ${loanId}:`, error);
        return null;
    }
}

export async function getLoansForUser(userId: string): Promise<Loan[]> {
    try {
        const client = await clientPromise;
        const db = client.db("oriango");
        const loans = await db.collection('loans').find({ borrowerId: userId }).toArray();
        return loans.map(loan => mapMongoId(loan)) as Loan[];
    } catch (error) {
        console.error(`Failed to get loans for user ${userId}:`, error);
        return [];
    }
}

export async function getLoansWithBorrowerDetails(): Promise<(Loan & { borrowerName: string })[]> {
    try {
        const client = await clientPromise;
        const db = client.db("oriango");
        const loans = await db.collection('loans').aggregate([
            {
                $lookup: {
                    from: "users",
                    // Note: In the DB, borrowerId is a string, not ObjectId. This is a potential issue from original code.
                    // Assuming borrowerId on loans collection matches the string version of a user's _id.
                    // If borrowerId were stored as ObjectId, this would need `localField: 'borrowerId'` and `foreignField: '_id'`
                    let: { borrower_id: { $toObjectId: "$borrowerId" } },
                    pipeline: [
                        { $match: { $expr: { $eq: [ "$_id", "$$borrower_id" ] } } }
                    ],
                    as: "borrowerInfo"
                }
            },
            {
                $unwind: {
                    path: "$borrowerInfo",
                    preserveNullAndEmptyArrays: true // Keep loans even if borrower is not found
                }
            },
            {
                $addFields: {
                    borrowerName: { $ifNull: [ "$borrowerInfo.name", "Unknown" ] }
                }
            },
            {
                $project: {
                    borrowerInfo: 0 // Remove the joined borrower document
                }
            }
        ]).toArray();

        return loans.map(loan => mapMongoId(loan as any)) as (Loan & { borrowerName: string })[];
    } catch (error) {
        console.error("Failed to get loans with borrower details:", error);
        return [];
    }
}

// --- AI Actions ---

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


// --- Dashboard Actions ---

export async function getDashboardStats() {
    try {
        const client = await clientPromise;
        const db = client.db("oriango");
        const usersCollection = db.collection('users');
        const loansCollection = db.collection('loans');

        const totalUsers = await usersCollection.countDocuments();
        const allLoans = await loansCollection.find({}).toArray() as Loan[];
        
        const activeLoans = allLoans.filter(loan => calculateOutstandingBalance(loan) > 0).length;
        const totalLoaned = allLoans.reduce((acc, loan) => acc + loan.amount, 0);
        const totalPaid = allLoans.reduce(
            (acc, loan) => acc + loan.repayments.reduce((sum, p) => sum + p.amount, 0),
            0
        );
        
        return { totalUsers, activeLoans, totalLoaned, totalPaid, error: null };
    } catch (error) {
        console.error("Failed to get dashboard stats:", error);
        return { totalUsers: 0, activeLoans: 0, totalLoaned: 0, totalPaid: 0, error: 'Could not load dashboard statistics.' };
    }
}
