export type UserRole = 'user' | 'admin' | 'super-admin';

export type User = {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  joinDate: string;
  role: UserRole;
};

export type Repayment = {
  id: string;
  amount: number;
  date: string;
};

export type Loan = {
  id: string;
  borrowerId: string; // Corresponds to User ID
  amount: number;
  interestRate: number; // as a percentage, e.g., 5 for 5%
  issueDate: string;
  repaymentSchedule: 'weekly' | 'monthly';
  status: 'active' | 'paid' | 'pending' | 'rejected';
  repayments: Repayment[];
};
