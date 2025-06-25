export type Borrower = {
  id: string;
  name: string;
  phone: string;
  address: string;
  joinDate: string;
};

export type Repayment = {
  id: string;
  amount: number;
  date: string;
};

export type Loan = {
  id: string;
  borrowerId: string;
  amount: number;
  interestRate: number; // as a percentage, e.g., 5 for 5%
  issueDate: string;
  repaymentSchedule: 'weekly' | 'monthly';
  status: 'active' | 'paid';
  repayments: Repayment[];
};
