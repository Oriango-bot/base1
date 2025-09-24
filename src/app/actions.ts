

'use server';

import { summarizeLoanHistory } from '@/ai/flows/summarize-loan-history';
import { calculateLoanEligibility, type LoanEligibilityInput } from '@/ai/flows/loan-eligibility-flow';
import { generatePasswordResetEmail } from '@/ai/flows/generate-password-reset-email-flow';
import type { Loan, User, UserRole, FormSeries, Repayment, LoanStatus, ApiKey } from '@/lib/types';
import { calculateOutstandingBalance, formatCurrency } from '@/lib/utils';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { randomBytes } from 'crypto';
import { updateUserCreditScore, calculateRepaymentScore } from '@/lib/services/credit-score.service';

// --- Utility function to map MongoDB documents (if needed elsewhere) ---
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
    return users.map(user => ({
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      phone: user.phone,
      address: user.address,
      joinDate: user.joinDate,
      role: user.role,
      partnerId: user.partnerId,
      creditScore: user.creditScore,
      creditScoreHistory: user.creditScoreHistory || [],
    })) as User[];
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
    if (!user) return null;
    
    return {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      phone: user.phone,
      address: user.address,
      joinDate: user.joinDate,
      role: user.role,
      partnerId: user.partnerId,
      creditScore: user.creditScore,
      creditScoreHistory: user.creditScoreHistory || [],
    } as User;
  } catch (error) {
    console.error(`Failed to get user ${userId}:`, error);
    return null;
  }
}

export async function loginUser(data: FormData): Promise<{ user: User | null; error: string | null }> {
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
    
    // Manually create a safe user object to return to the client
    const userToReturn: User = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      phone: user.phone,
      address: user.address,
      joinDate: user.joinDate,
      role: user.role,
      partnerId: user.partnerId,
      creditScore: user.creditScore || 500,
      creditScoreHistory: user.creditScoreHistory || [],
    };
    
    return { user: userToReturn, error: null };
  } catch (e) {
    console.error("Detailed error in loginUser action:", (e as Error).message, (e as Error).stack);
    return { user: null, error: 'An unexpected error occurred. Please check server logs for details.' };
  }
}

export async function signupUser(data: FormData): Promise<{ user: User | null; error: string | null }> {
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

    const isSuperAdminPresentValue = await isSuperAdminPresent();
    const role: UserRole = isSuperAdminPresentValue ? 'user' : 'super-admin';

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
      creditScore: 500, // Starting credit score
      creditScoreHistory: [{
          date: new Date().toISOString(),
          change: 0,
          reason: 'Account created.',
          newScore: 500,
      }],
    };

    const result = await usersCollection.insertOne(newUserDoc);
    const createdUser = await usersCollection.findOne({_id: result.insertedId});
    
    if (!createdUser) {
        return { user: null, error: 'Failed to retrieve user after creation.' };
    }

    // Manually create a safe user object to return to the client
    const userToReturn: User = {
        id: createdUser._id.toString(),
        name: createdUser.name,
        email: createdUser.email,
        phone: createdUser.phone,
        address: createdUser.address,
        joinDate: createdUser.joinDate,
        role: createdUser.role,
        partnerId: createdUser.partnerId,
        creditScore: createdUser.creditScore,
        creditScoreHistory: createdUser.creditScoreHistory,
    };

    return { user: userToReturn, error: null };
  } catch (e) {
    console.error("Detailed error in signupUser action:", (e as Error).message, (e as Error).stack);
    return { user: null, error: 'An unexpected error occurred during signup. Please check server logs for details.' };
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
      creditScore: 500, // Starting credit score
      creditScoreHistory: [{
          date: new Date().toISOString(),
          change: 0,
          reason: 'Account created by admin.',
          newScore: 500,
      }],
    };

    const result = await usersCollection.insertOne(newUserDoc);
    const createdUser = await usersCollection.findOne({_id: result.insertedId});
    
     if (!createdUser) {
        return { user: null, error: 'Failed to retrieve user after creation.' };
    }

    // Manually create a safe user object to return to the client
    const userToReturn: User = {
        id: createdUser._id.toString(),
        name: createdUser.name,
        email: createdUser.email,
        phone: createdUser.phone,
        address: createdUser.address,
        joinDate: createdUser.joinDate,
        role: createdUser.role,
        partnerId: createdUser.partnerId,
        creditScore: createdUser.creditScore,
        creditScoreHistory: createdUser.creditScoreHistory,
    };

    return { user: userToReturn, error: null };
  } catch (e) {
    console.error("Detailed error in addUserByAdmin action:", (e as Error).message, (e as Error).stack);
    return { user: null, error: 'An unexpected error occurred during user creation. Please check server logs for details.' };
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


export async function requestPasswordReset(formData: FormData): Promise<{ success: boolean; message: string; }> {
  const email = formData.get('email') as string;

  if (!email) {
    return { success: false, message: 'Email is required.' };
  }

  try {
    const client = await clientPromise;
    const db = client.db('oriango');
    const usersCollection = db.collection('users');

    const user = await usersCollection.findOne({ email });

    // For security, don't reveal if the user exists.
    // Always return a generic success message.
    if (!user) {
      return { success: true, message: 'If an account with that email exists, a password reset link has been sent.' };
    }
    
    const tempPassword = randomBytes(8).toString('hex').slice(0, 8);
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    await usersCollection.updateOne(
      { _id: user._id },
      { $set: { password: hashedPassword } }
    );
    
    // Simulate sending email. A real implementation would use an email service.
    try {
      const emailContent = await generatePasswordResetEmail({
        userName: user.name,
        tempPassword: tempPassword,
      });
      // In a real app, you would use a service like Nodemailer, SendGrid, etc.
      // to send the email with emailContent.subject and emailContent.body
      console.log('--- SIMULATING EMAIL SEND ---');
      console.log(`To: ${user.email}`);
      console.log(`Subject: ${emailContent.subject}`);
      console.log(`Body: ${emailContent.body}`);
      console.log('-----------------------------');
    } catch (emailError) {
        console.error("Failed to generate or simulate sending password reset email:", emailError);
        // Even if email fails, don't block the user. The password has been reset.
        // They may need to contact support if they don't receive it.
    }
    
    return { success: true, message: 'If an account with that email exists, you will receive an email with a temporary password.' };
  } catch (e) {
    console.error("Error in requestPasswordReset action: ", e);
    // Return a generic error to the user
    return { success: false, message: 'An unexpected error occurred. Please try again or contact support.' };
  }
}

export async function adminUpdatePassword(adminId: string, targetUserId: string, newPassword: string): Promise<{ success: boolean; error: string | null }> {
  if (!adminId || !targetUserId || !newPassword) {
    return { success: false, error: 'Missing required parameters.' };
  }
  
  try {
    const client = await clientPromise;
    const db = client.db("oriango");
    const usersCollection = db.collection('users');
    
    // Verify admin privileges
    const adminUser = await usersCollection.findOne({ _id: new ObjectId(adminId) });
    if (!adminUser || adminUser.role !== 'super-admin') {
      return { success: false, error: 'You do not have permission to perform this action.' };
    }

    // Hash new password and update user
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const result = await usersCollection.updateOne(
        { _id: new ObjectId(targetUserId) },
        { $set: { password: hashedPassword } }
    );
    
    if (result.modifiedCount === 0) {
      return { success: false, error: 'Could not find the user to update.' };
    }

    return { success: true, error: null };
  } catch (error) {
    console.error("Failed to update password:", error);
    return { success: false, error: 'An unexpected server error occurred.' };
  }
}


// --- Loan Actions ---

export async function createLoan(formData: FormData) {
  const borrowerId = formData.get('borrowerId') as string;
  const createdBy = formData.get('createdBy') as string;

  if (!borrowerId || !createdBy) {
    return { success: false, error: 'Missing required system data.' };
  }
  
  try {
    const client = await clientPromise;
    const db = client.db("oriango");
    const loansCollection = db.collection('loans');
    
    // Generate a unique form number
    let formNumber: string;
    let isUnique = false;
    while (!isUnique) {
        const uniquePart = randomBytes(4).toString('hex').toUpperCase();
        // Assuming Oriango's partner ID is 1
        formNumber = `P-1-MLD-GEN-${uniquePart}`; 
        const existingLoan = await loansCollection.findOne({ formNumber });
        if (!existingLoan) {
            isUnique = true;
        }
    }

    const amount = parseFloat(formData.get('amount') as string);
    const interestRate = 15; // Standard 15% flat rate
    const processingFee = amount * 0.025; // 2.5% processing fee

    const getBool = (key: string) => formData.get(key) === 'true';

    const guarantor1Name = formData.get('guarantor1Name') as string;
    const guarantor1Id = formData.get('guarantor1Id') as string;
    const guarantor1Phone = formData.get('guarantor1Phone') as string;
    const guarantors = [];
    if (guarantor1Name && guarantor1Id && guarantor1Phone) {
        guarantors.push({
            name: guarantor1Name,
            idNumber: guarantor1Id,
            phone: guarantor1Phone,
        });
    }

    const newLoanDoc: Omit<Loan, 'id'> = {
      borrowerId,
      formNumber,
      amount,
      interestRate,
      repaymentSchedule: formData.get('repaymentSchedule') as 'daily' | 'weekly' | 'bi-weekly' | 'monthly',
      idNumber: formData.get('idNumber') as string,
      dob: formData.get('dob') as string,
      nextOfKinName: formData.get('nextOfKinName') as string,
      nextOfKinRelationship: formData.get('nextOfKinRelationship') as string,
      nextOfKinContact: formData.get('nextOfKinContact') as string,
      occupation: formData.get('occupation') as string,
      employerName: formData.get('employerName') as string,
      workLocation: formData.get('workLocation') as string,
      workLandmark: formData.get('workLandmark') as string,
      monthlyIncome: parseFloat(formData.get('monthlyIncome') as string),
      sourceOfIncome: formData.get('sourceOfIncome') as string,
      sourceOfIncomeOther: formData.get('sourceOfIncomeOther') as string || undefined,
      productType: formData.get('productType') as string,
      loanPurpose: formData.getAll('loanPurpose') as string[],
      loanPurposeOther: formData.get('loanPurposeOther') as string || undefined,
      processingFee,
      hasCollateral: getBool('hasCollateral'),
      collateral: [
          { description: formData.get('collateral1') as string },
          { description: formData.get('collateral2') as string },
          { description: formData.get('collateral3') as string },
      ].filter(c => c.description),
      collateralValue: parseFloat(formData.get('collateralValue') as string) || 0,
      guarantors,
      attachments: {
        idCopy: getBool('attachments_idCopy'),
        incomeProof: getBool('attachments_incomeProof'),
        guarantorIdCopies: getBool('attachments_guarantorIdCopies'),
        businessLicense: getBool('attachments_businessLicense'),
        passportPhoto: getBool('attachments_passportPhoto'),
      },
      declarationSignature: formData.get('declarationSignature') as string,
      declarationDate: new Date().toISOString(),
      issueDate: new Date().toISOString(),
      status: 'pending' as LoanStatus,
      statusHistory: [{ status: 'pending' as LoanStatus, date: new Date().toISOString(), changedBy: createdBy }],
      repayments: [],
      partnerId: 1, 
      createdBy,
    };

    const result = await loansCollection.insertOne(newLoanDoc);

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
        return loan ? mapMongoId(loan as any) as Loan : null;
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
        return loans.map(loan => mapMongoId(loan as any)) as Loan[];
    } catch (error) {
        console.error(`Failed to get loans for user ${userId}:`, error);
        return [];
    }
}

export async function getLoansWithBorrowerDetails(): Promise<(Loan & { borrowerName: string, partnerName: string })[]> {
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
                $lookup: {
                    from: "api_keys",
                    localField: "partnerId",
                    foreignField: "partnerId",
                    as: "partnerInfo"
                }
            },
            {
                $unwind: {
                    path: "$partnerInfo",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $addFields: {
                    borrowerName: { $ifNull: [ "$borrowerInfo.name", "Unknown" ] },
                    partnerName: { $ifNull: [ "$partnerInfo.partnerName", "Oriango" ] }
                }
            },
            {
                $project: {
                    borrowerInfo: 0,
                    partnerInfo: 0,
                }
            }
        ]).sort({ issueDate: -1 }).toArray();

        return loans.map(loan => mapMongoId(loan as any)) as (Loan & { borrowerName: string, partnerName: string })[];
    } catch (error) {
        console.error("Failed to get loans with borrower details:", error);
        return [];
    }
}

export async function recordRepayment(formData: FormData) {
  const loanId = formData.get('loanId') as string;
  const amountStr = formData.get('amount') as string;
  const recordedBy = formData.get('recordedBy') as string;

  const SCORE_ACTIONS = {
      LOAN_COMPLETED: {
          change: 25,
          reasonTemplate: "Loan {loanId} paid off successfully."
      },
      FIRST_LOAN_COMPLETED: {
          change: 50,
          reasonTemplate: "First loan {loanId} completed. Welcome bonus!"
      }
  };

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
    const usersCollection = db.collection('users');

    const loanToUpdate = await loansCollection.findOne({ _id: new ObjectId(loanId) });
    if (!loanToUpdate) {
        return { success: false, error: 'Loan not found.' };
    }

    // @ts-ignore
    const loan = mapMongoId(loanToUpdate as any) as Loan;

    // --- Credit Score Logic ---
    const { change, reason } = await calculateRepaymentScore(loan, amount);
    await updateUserCreditScore(loan.borrowerId, change, reason);
    // --- End Credit Score ---

    const newRepayment: Repayment = {
        id: uuidv4(),
        amount: amount,
        date: new Date().toISOString()
    };
    
    const updatedRepayments = [...loanToUpdate.repayments, newRepayment];
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

        // If loan is now paid, apply credit score bonus
        if (newStatus === 'paid') {
            const userLoans = await loansCollection.find({ borrowerId: loan.borrowerId, status: 'paid' }).toArray();
            const isFirstLoan = userLoans.length === 1; // The current loan is now paid
            const action = isFirstLoan ? SCORE_ACTIONS.FIRST_LOAN_COMPLETED : SCORE_ACTIONS.LOAN_COMPLETED;
            const reasonText = action.reasonTemplate.replace('{loanId}', loan.formNumber.slice(-8));
            await updateUserCreditScore(loan.borrowerId, action.change, reasonText);
        }
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

export async function getFormSeries(): Promise<(FormSeries & { partnerName: string })[]> {
    try {
        const client = await clientPromise;
        const db = client.db("oriango");
        const series = await db.collection('form_series_register').aggregate([
            {
                $lookup: {
                    from: "api_keys", // Assuming partner names are in api_keys collection
                    localField: "partner_id",
                    foreignField: "partnerId",
                    as: "partnerInfo"
                }
            },
            {
                $unwind: {
                    path: "$partnerInfo",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $addFields: {
                    partnerName: { $ifNull: ["$partnerInfo.partnerName", "Oriango"] }
                }
            },
            {
                $project: {
                    partnerInfo: 0
                }
            }
        ]).toArray();
        return series.map(s => mapMongoId(s as any)) as (FormSeries & { partnerName: string })[];
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

// --- API Key Actions ---

export async function getApiKeys(): Promise<ApiKey[]> {
  try {
    const client = await clientPromise;
    const db = client.db("oriango");
    const apiKeys = await db.collection('api_keys').find({}).sort({ createdAt: -1 }).toArray();
    return apiKeys.map(key => mapMongoId(key as any)) as ApiKey[];
  } catch (error) {
    console.error("Failed to get API keys:", error);
    return [];
  }
}

export async function getNextPartnerId(): Promise<number> {
  try {
    const client = await clientPromise;
    const db = client.db("oriango");
    const apiKeysCollection = db.collection('api_keys');

    // Find the partner with the highest ID
    const lastPartner = await apiKeysCollection.find().sort({ partnerId: -1 }).limit(1).toArray();
    
    if (lastPartner.length > 0) {
      // @ts-ignore
      return lastPartner[0].partnerId + 1;
    }
    
    // If no partners exist, start with 2 (since 1 is Oriango)
    return 2; 
  } catch (error) {
    console.error("Failed to get next partner ID:", error);
    // Fallback to a high number to avoid collisions on error
    return 99; 
  }
}

export async function createApiKeyAction(formData: FormData): Promise<{ success: boolean; error: string | null; newKey?: string }> {
  const partnerName = formData.get('partnerName') as string;
  const partnerIdStr = formData.get('partnerId') as string;
  const scopes = formData.getAll('scopes') as string[];

  if (!partnerName || !partnerIdStr || scopes.length === 0) {
    return { success: false, error: 'Partner name, ID, and at least one scope are required.' };
  }
  const partnerId = parseInt(partnerIdStr, 10);
  if (isNaN(partnerId)) {
    return { success: false, error: 'Invalid Partner ID.' };
  }

  try {
    const client = await clientPromise;
    const db = client.db("oriango");
    const apiKeysCollection = db.collection('api_keys');

    // Check if partner ID already exists
    const existingKey = await apiKeysCollection.findOne({ partnerId });
    if (existingKey) {
        return { success: false, error: `Partner ID ${partnerId} is already in use by ${existingKey.partnerName}.` };
    }

    const newKeyDoc = {
      key: `oriango_sk_${uuidv4().replace(/-/g, '')}`, // A more identifiable key format
      partnerName,
      partnerId,
      scopes,
      enabled: true,
      createdAt: new Date().toISOString(),
      lastUsed: null,
      requestCount: 0,
    };

    await apiKeysCollection.insertOne(newKeyDoc);
    
    return { success: true, error: null, newKey: newKeyDoc.key };
  } catch (error) {
    console.error("Failed to create API key:", error);
    return { success: false, error: 'An unexpected server error occurred.' };
  }
}

export async function updateApiKeyStatus(keyId: string, enabled: boolean): Promise<{ success: boolean; error: string | null }> {
  try {
    const client = await clientPromise;
    const db = client.db("oriango");
    const result = await db.collection('api_keys').updateOne(
      { _id: new ObjectId(keyId) },
      { $set: { enabled } }
    );
    if (result.modifiedCount === 0) throw new Error("API key not found or status is already the same.");
    return { success: true, error: null };
  } catch (error) {
    console.error("Failed to update API key status:", error);
    return { success: false, error: (error as Error).message };
  }
}

export async function deleteApiKey(keyId: string): Promise<{ success: boolean; error: string | null }> {
  try {
    const client = await clientPromise;
    const db = client.db("oriango");
    const result = await db.collection('api_keys').deleteOne({ _id: new ObjectId(keyId) });
    if (result.deletedCount === 0) throw new Error("API key not found.");
    return { success: true, error: null };
  } catch (error) {
    console.error("Failed to delete API key:", error);
    return { success: false, error: (error as Error).message };
  }
}


    

