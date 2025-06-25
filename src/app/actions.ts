
'use server';

import { summarizeLoanHistory } from '@/ai/flows/summarize-loan-history';
import { calculateLoanEligibility, type LoanEligibilityInput } from '@/ai/flows/loan-eligibility-flow';
import type { Loan, User, UserRole, FormSeries, Repayment, LoanStatus } from '@/lib/types';
import { calculateOutstandingBalance, formatCurrency } from '@/lib/utils';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

// --- Utility function to map MongoDB documents ---
function mapMongoId<T extends { _id: ObjectId }>(doc: T): Omit<T, '_id'> & { id: string } {
  const { _id, ...rest } = doc;
  return { ...rest, id: _id.toString() };
}

// --- User Actions ---

export async function isSuperAdminPresent(): Promise<boolean> {
  try {
    const client = await clientPromise;
    const db = client.db("oriango");
    const usersCollection = db.collection('users');
    const superAdmin = await usersCollection.findOne({ role: 'super-admin' });
    return !!superAdmin;
  } catch (error) {
    console.error("Failed to check for super admin:", error);
    // On error, assume one might exist to prevent creating multiple.
    return true;
  }
}

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
      partnerId: 1, // Default to Oriango
    };

    const result = await usersCollection.insertOne(newUserDoc);
    const createdUser = await usersCollection.findOne({_id: result.insertedId});
    
    if (!createdUser) {
        return { user: null, error: 'Failed to retrieve user after creation.' };
    }

    const finalUser = mapMongoId(createdUser);
    // @ts-ignore
    delete finalUser.password;
    
    return { user: finalUser as User, error: null };
  } catch (e) {
    console.error(e);
    return { user: null, error: 'An unexpected error occurred during signup.' };
  }
}

export async function addUserByAdmin(formData: FormData): Promise<{ user: User | null; error: string | null }> {
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const phone = formData.get('phone') as string;
  const address = formData.get('address') as string;

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

    const hashedPassword = await bcrypt.hash(password, 10);
    
    const newUserDoc = {
      name,
      email,
      password: hashedPassword,
      phone,
      address,
      role: 'user' as UserRole, // Always 'user' when added by admin
      joinDate: new Date().toISOString(),
      partnerId: 1, // Default to Oriango
    };

    const result = await usersCollection.insertOne(newUserDoc);
    const createdUser = await usersCollection.findOne({_id: result.insertedId});
    
     if (!createdUser) {
        return { user: null, error: 'Failed to retrieve user after creation.' };
    }

    const finalUser = mapMongoId(createdUser);
    // @ts-ignore
    delete finalUser.password;
    
    return { user: finalUser as User, error: null };
  } catch (e) {
    console.error(e);
    return { user: null, error: 'An unexpected error occurred during user creation.' };
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

export async function createLoan(formData: FormData) {
  const amount = parseFloat(formData.get('amount') as string);
  const interestRate = parseFloat(formData.get('interestRate') as string);
  const repaymentSchedule = formData.get('repaymentSchedule') as 'weekly' | 'monthly';
  const formNumber = formData.get('formNumber') as string;
  const borrowerId = formData.get('borrowerId') as string;
  const createdBy = formData.get('createdBy') as string;

  if (!amount || !interestRate || !repaymentSchedule || !formNumber || !borrowerId || !createdBy) {
    return { success: false, error: 'Missing required loan data.' };
  }

  try {
    const client = await clientPromise;
    const db = client.db("oriango");
    
    const creator = await db.collection('users').findOne({ _id: new ObjectId(createdBy) });
    if (!creator) {
        return { success: false, error: 'Loan creator not found.' };
    }
    // @ts-ignore
    const partnerId = creator.partnerId;

    const existingLoan = await db.collection('loans').findOne({ formNumber });
    if (existingLoan) {
      return { success: false, error: `Form number ${formNumber} is already in use.` };
    }

    let validationSource = 'uniqueness_only';

    const activeSeries = await db.collection('form_series_register').findOne({ 
        partner_id: partnerId,
        status: 'active'
    });
    
    if (activeSeries) {
        validationSource = 'form_series_register';
        
        if (!formNumber.startsWith(activeSeries.prefix)) {
            return { success: false, error: `Form number must start with prefix "${activeSeries.prefix}".` };
        }

        const numberPart = formNumber.substring(activeSeries.prefix.length);
        const number = parseInt(numberPart, 10);

        if (isNaN(number)) {
            return { success: false, error: 'Form number does not contain a valid number after the prefix.' };
        }

        if (number < activeSeries.start_number || number > activeSeries.end_number) {
            return { success: false, error: `Form number ${number} is outside the allowed range (${activeSeries.start_number}-${activeSeries.end_number}).` };
        }
    } else if (partnerId === 1) {
        return { success: false, error: 'No active form series found for Oriango (Partner ID 1). Please contact an administrator.' };
    }
    
    const newLoanDoc = {
      borrowerId,
      amount,
      interestRate,
      issueDate: new Date().toISOString(),
      repaymentSchedule,
      status: 'pending' as LoanStatus,
      statusHistory: [{ status: 'pending' as LoanStatus, date: new Date().toISOString(), changedBy: createdBy }],
      repayments: [],
      formNumber,
      partnerId,
      createdBy,
      validationSource,
    };

    const result = await db.collection('loans').insertOne(newLoanDoc);

    return { success: true, loanId: result.insertedId.toString() };
  } catch (error) {
    console.error("Failed to create loan:", error);
    return { success: false, error: 'An unexpected server error occurred.' };
  }
}

export async function updateLoanStatus(formData: FormData) {
  const loanId = formData.get('loanId') as string;
  const newStatus = formData.get('newStatus') as LoanStatus;
  const adminId = formData.get('adminId') as string;

  if (!loanId || !newStatus || !adminId) {
    return { success: false, error: 'Missing required data.' };
  }
  
  try {
    const client = await clientPromise;
    const db = client.db("oriango");
    
    const newHistoryEntry = {
        status: newStatus,
        date: new Date().toISOString(),
        changedBy: adminId
    };

    const result = await db.collection('loans').updateOne(
        { _id: new ObjectId(loanId) },
        { 
            $set: { status: newStatus },
            $push: { statusHistory: newHistoryEntry }
        }
    );

    if (result.modifiedCount === 0) {
        return { success: false, error: "Loan not found or status is already the same." };
    }

    return { success: true };
  } catch (error) {
    console.error("Failed to update loan status:", error);
    return { success: false, error: 'An unexpected server error occurred.' };
  }
}


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
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $addFields: {
                    borrowerName: { $ifNull: [ "$borrowerInfo.name", "Unknown" ] }
                }
            },
            {
                $project: {
                    borrowerInfo: 0
                }
            }
        ]).sort({ issueDate: -1 }).toArray();

        return loans.map(loan => mapMongoId(loan as any)) as (Loan & { borrowerName: string })[];
    } catch (error) {
        console.error("Failed to get loans with borrower details:", error);
        return [];
    }
}

export async function recordRepayment(formData: FormData) {
  const loanId = formData.get('loanId') as string;
  const amountStr = formData.get('amount') as string;
  const recordedBy = formData.get('recordedBy') as string;

  if (!loanId || !amountStr || !recordedBy) {
    return { success: false, error: 'Missing required repayment data.' };
  }

  const amount = parseFloat(amountStr);
  if (isNaN(amount) || amount <= 0) {
    return { success: false, error: 'Invalid repayment amount.' };
  }

  try {
    const client = await clientPromise;
    const db = client.db("oriango");
    const loansCollection = db.collection('loans');

    const loanToUpdate = await loansCollection.findOne({ _id: new ObjectId(loanId) });
    if (!loanToUpdate) {
        return { success: false, error: 'Loan not found.' };
    }

    const newRepayment: Repayment = {
        id: uuidv4(),
        amount: amount,
        date: new Date().toISOString()
    };
    
    const updatedRepayments = [...loanToUpdate.repayments, newRepayment];
    // @ts-ignore
    const updatedStatusHistory = loanToUpdate.statusHistory ? [...loanToUpdate.statusHistory] : [];
    const totalPaid = updatedRepayments.reduce((sum, p) => sum + p.amount, 0);
    const totalOwed = loanToUpdate.amount * (1 + loanToUpdate.interestRate / 100);

    let newStatus = loanToUpdate.status;
    if (totalPaid >= totalOwed) {
        newStatus = 'paid';
    } else if (loanToUpdate.status !== 'active') {
        newStatus = 'active'; // any payment on a non-paid loan makes it active
    }

    const updateDoc: any = {
        $set: {
            repayments: updatedRepayments,
        }
    };
    if (newStatus !== loanToUpdate.status) {
        updateDoc.$set.status = newStatus;
        const historyEntry = {
            status: newStatus,
            date: new Date().toISOString(),
            changedBy: recordedBy,
        };
        // @ts-ignore
        updatedStatusHistory.push(historyEntry);
        updateDoc.$set.statusHistory = updatedStatusHistory;
    }

    await loansCollection.updateOne({ _id: new ObjectId(loanId) }, updateDoc);

    return { success: true };
  } catch (error) {
    console.error("Failed to record repayment:", error);
    return { success: false, error: 'An unexpected server error occurred.' };
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
        const allLoans = await loansCollection.find({}).toArray() as any[];
        
        const activeLoans = allLoans.filter(loan => calculateOutstandingBalance(loan) > 0).length;
        const totalLoaned = allLoans.reduce((acc, loan) => acc + loan.amount, 0);
        const totalPaid = allLoans.reduce(
            (acc, loan) => acc + (loan.repayments?.reduce((sum, p) => sum + p.amount, 0) || 0),
            0
        );
        
        return { totalUsers, activeLoans, totalLoaned, totalPaid, error: null };
    } catch (error) {
        console.error("Failed to get dashboard stats:", error);
        return { totalUsers: 0, activeLoans: 0, totalLoaned: 0, totalPaid: 0, error: 'Could not load dashboard statistics.' };
    }
}


// --- Form Series Actions ---

export async function getFormSeries() {
    try {
        const client = await clientPromise;
        const db = client.db("oriango");
        const series = await db.collection('form_series_register').find({}).toArray();
        return series.map(s => mapMongoId(s as any)) as FormSeries[];
    } catch (error) {
        console.error("Failed to get form series:", error);
        return [];
    }
}

export async function createFormSeries(formData: FormData) {
    const prefix = formData.get('prefix') as string;
    const start_number = parseInt(formData.get('start_number') as string, 10);
    const end_number = parseInt(formData.get('end_number') as string, 10);
    const partner_id = parseInt(formData.get('partner_id') as string, 10);
    const created_by = formData.get('created_by') as string;

    if (!prefix || isNaN(start_number) || isNaN(end_number) || isNaN(partner_id) || !created_by) {
        return { success: false, error: 'Missing or invalid required fields.' };
    }
    
    if (start_number >= end_number) {
        return { success: false, error: 'Start number must be less than end number.' };
    }

    try {
        const client = await clientPromise;
        const db = client.db("oriango");
        const formSeriesCollection = db.collection('form_series_register');
        
        const newSeriesDoc = {
            prefix,
            start_number,
            end_number,
            partner_id,
            status: 'active' as 'active' | 'revoked' | 'frozen',
            created_by,
            createdAt: new Date().toISOString(),
        };

        await formSeriesCollection.insertOne(newSeriesDoc);

        return { success: true };
    } catch (error) {
        console.error("Failed to create form series:", error);
        return { success: false, error: 'An unexpected server error occurred.' };
    }
}
