import type { User, Loan } from './types';

export let users: User[] = [
  {
    id: 'user_1',
    name: 'Super Admin',
    email: 'super@oriango.com',
    phone: '555-0001',
    address: '1 Admin Way, Springfield',
    joinDate: '2023-01-01',
    role: 'super-admin',
  },
  {
    id: 'user_2',
    name: 'Normal Admin',
    email: 'admin@oriango.com',
    phone: '555-0002',
    address: '2 Admin Way, Springfield',
    joinDate: '2023-01-02',
    role: 'admin',
  },
  {
    id: 'user_3',
    name: 'Alice Johnson',
    email: 'alice@oriango.com',
    phone: '555-0101',
    address: '123 Maple St, Springfield',
    joinDate: '2023-01-15',
    role: 'user',
  },
  {
    id: 'user_4',
    name: 'Bob Williams',
    email: 'bob@oriango.com',
    phone: '555-0102',
    address: '456 Oak Ave, Springfield',
    joinDate: '2023-02-20',
    role: 'user',
  },
];

export let loans: Loan[] = [
  {
    id: 'loan_1',
    borrowerId: 'user_3',
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
    borrowerId: 'user_4',
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
    borrowerId: 'user_3',
    amount: 250,
    interestRate: 10,
    issueDate: '2023-08-10',
    repaymentSchedule: 'monthly',
    status: 'paid',
    repayments: [
        {id: 'rep_6', amount: 275, date: '2023-09-10' }
    ],
  },
  {
    id: 'loan_4',
    borrowerId: 'user_4',
    amount: 1500,
    interestRate: 8,
    issueDate: '2024-03-01',
    repaymentSchedule: 'monthly',
    status: 'pending',
    repayments: [],
  },
];
