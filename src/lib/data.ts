import type { Borrower, Loan } from './types';

export const borrowers: Borrower[] = [
  {
    id: 'bor_1',
    name: 'Alice Johnson',
    phone: '555-0101',
    address: '123 Maple St, Springfield',
    joinDate: '2023-01-15',
  },
  {
    id: 'bor_2',
    name: 'Bob Williams',
    phone: '555-0102',
    address: '456 Oak Ave, Springfield',
    joinDate: '2023-02-20',
  },
  {
    id: 'bor_3',
    name: 'Charlie Brown',
    phone: '555-0103',
    address: '789 Pine Ln, Springfield',
    joinDate: '2023-03-10',
  },
];

export const loans: Loan[] = [
  {
    id: 'loan_1',
    borrowerId: 'bor_1',
    amount: 500,
    interestRate: 5,
    issueDate: '2023-05-01',
    repaymentSchedule: 'monthly',
    status: 'active',
    repayments: [
      { id: 'rep_1', amount: 100, date: '2023-06-01' },
      { id: 'rep_2', amount: 100, date: '2023-07-01' },
    ],
  },
  {
    id: 'loan_2',
    borrowerId: 'bor_2',
    amount: 1000,
    interestRate: 7,
    issueDate: '2023-04-15',
    repaymentSchedule: 'weekly',
    status: 'active',
    repayments: [
      { id: 'rep_3', amount: 50, date: '2023-04-22' },
      { id: 'rep_4', amount: 50, date: '2023-04-29' },
      { id: 'rep_5', amount: 50, date: '2023-05-06' },
    ],
  },
  {
    id: 'loan_3',
    borrowerId: 'bor_1',
    amount: 250,
    interestRate: 10,
    issueDate: '2023-08-10',
    repaymentSchedule: 'monthly',
    status: 'paid',
    repayments: [
        {id: 'rep_6', amount: 275, date: '2023-09-10' }
    ],
  },
];
