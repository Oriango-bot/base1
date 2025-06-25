export type UserRole = 'user' | 'admin' | 'super-admin';

export type User = {
  id: string;
  name: string;
  email: string;
  password?: string; // Hashed password, optional on fetch
  phone: string;
  address: string;
  joinDate: string;
  role: UserRole;
  partnerId: number; // 1 for Oriango, others for partners
};

export type Repayment = {
  id: string;
  amount: number;
  date: string;
};

export type LoanStatus = 'pending' | 'approved' | 'rejected' | 'active' | 'paid';

export type StatusHistoryEntry = {
  status: LoanStatus;
  date: string;
  changedBy: string; // User ID
};

export type Loan = {
  id:string;
  borrowerId: string; // Corresponds to User ID
  amount: number;
  interestRate: number; // as a percentage, e.g., 5 for 5%
  issueDate: string;
  repaymentSchedule: 'weekly' | 'monthly';
  status: LoanStatus;
  repayments: Repayment[];
  formNumber: string;
  partnerId: number;
  createdBy: string; // User ID of the admin who created the loan
  validationSource: string; // e.g., 'form_series_register' or 'uniqueness_only'
  statusHistory: StatusHistoryEntry[];
};

export type FormSeries = {
  id: string;
  prefix: string;
  start_number: number;
  end_number: number;
  partner_id: number;
  status: 'active' | 'revoked' | 'frozen';
  created_by: string; // User ID of admin/super-admin
  createdAt: string;
};
