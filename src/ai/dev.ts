import { config } from 'dotenv';
config();

import '@/ai/flows/summarize-loan-history.ts';
import '@/ai/flows/loan-eligibility-flow.ts';
import '@/ai/flows/generate-password-reset-email-flow.ts';
