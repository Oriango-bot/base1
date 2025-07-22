'use server';
/**
 * @fileOverview An AI flow to generate a password reset email.
 *
 * - generatePasswordResetEmail - A function that generates the content for a password reset email.
 * - GeneratePasswordResetEmailInput - The input type for the function.
 * - GeneratePasswordResetEmailOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

export const GeneratePasswordResetEmailInputSchema = z.object({
  userName: z.string().describe("The name of the user who requested the password reset."),
  tempPassword: z.string().describe("The temporary password that was generated for the user."),
});
export type GeneratePasswordResetEmailInput = z.infer<typeof GeneratePasswordResetEmailInputSchema>;

export const GeneratePasswordResetEmailOutputSchema = z.object({
  subject: z.string().describe("The subject line for the password reset email."),
  body: z.string().describe("The HTML body of the password reset email."),
});
export type GeneratePasswordResetEmailOutput = z.infer<typeof GeneratePasswordResetEmailOutputSchema>;


export async function generatePasswordResetEmail(input: GeneratePasswordResetEmailInput): Promise<GeneratePasswordResetEmailOutput> {
  return generatePasswordResetEmailFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generatePasswordResetEmailPrompt',
  input: {schema: GeneratePasswordResetEmailInputSchema},
  output: {schema: GeneratePasswordResetEmailOutputSchema},
  prompt: `You are an AI assistant for Oriango MicroFinance. Your task is to generate a professional and clear password reset email.

  The user's name is {{{userName}}}.
  Their temporary password is: {{{tempPassword}}}

  Generate an email with a clear subject line and a body that instructs the user to log in with their temporary password and change it immediately for security reasons. The tone should be helpful and professional. Address the user by their name. Do not include any greetings before the subject or any text after the JSON output.
  `,
});

const generatePasswordResetEmailFlow = ai.defineFlow(
  {
    name: 'generatePasswordResetEmailFlow',
    inputSchema: GeneratePasswordResetEmailInputSchema,
    outputSchema: GeneratePasswordResetEmailOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error("The AI model did not return a valid email content. Please try again.");
    }
    return output;
  }
);
