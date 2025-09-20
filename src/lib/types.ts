

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
  repaymentSchedule: 'daily' | 'weekly' | 'bi-weekly' | 'monthly';
  status: LoanStatus;
  repayments: Repayment[];
  formNumber: string;
  partnerId: number;
  createdBy: string; // User ID of the admin who created the loan
  statusHistory: StatusHistoryEntry[];
  
  // NEW FIELDS FROM FORM
  idNumber: string;
  dob: string;
  nextOfKinName: string;
  nextOfKinRelationship: string;
  nextOfKinContact: string;

  occupation: string;
  employerName: string;
  workLocation: string;
  workLandmark: string;
  monthlyIncome: number;
  sourceOfIncome: string; // 'salary', 'business', 'farming', 'other'
  sourceOfIncomeOther?: string;

  productType: string; // 'biz-flex', 'hustle-flex', 'rent-flex'
  loanPurpose: string[]; // ['stock', 'rent', etc.]
  loanPurposeOther?: string;
  processingFee: number;
  
  hasCollateral: boolean;
  collateral: { description: string }[];
  collateralValue: number;
  guarantors: { name: string; idNumber: string; phone: string; }[];
  
  attachments: {
    idCopy: boolean;
    incomeProof: boolean;
    guarantorIdCopies: boolean;
    businessLicense: boolean;
    passportPhoto: boolean;
  };
  
  declarationSignature: string; // just applicant name for now
  declarationDate: string;
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

export type ApiKey = {
    id: string;
    key: string;
    partnerName: string;
    partnerId: number;
    scopes: string[]; // e.g., ['forms:read', 'forms:write']
    enabled: boolean;
    createdAt: string;
    lastUsed: string | null;
    requestCount: number;
};


    