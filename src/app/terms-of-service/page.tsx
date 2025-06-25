
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function TermsOfServicePage() {
  return (
    <div className="container mx-auto py-12 px-4 md:px-6">
      <Card>
        <CardHeader>
          <CardTitle>Terms of Service</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className='text-sm text-muted-foreground'>Last updated: June 4, 2024</p>
          
          <h3 className="font-semibold text-lg">1. Introduction</h3>
          <p>
            Welcome to Oriango MicroFinance (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;). These Terms of Service (&quot;Terms&quot;) govern your use of our website and services. By accessing or using our services, you agree to be bound by these Terms.
          </p>
          
          <h3 className="font-semibold text-lg">2. Use of Our Services</h3>
          <p>
            You must be at least 18 years old to use our services. You agree to provide accurate and complete information when applying for a loan or creating an account.
          </p>
          
          <h3 className="font-semibold text-lg">3. Loans</h3>
          <p>
            All loan applications are subject to approval. We reserve the right to accept or reject any application at our sole discretion. Loan terms, including interest rates and repayment schedules, will be provided to you upon approval.
          </p>
          
          <h3 className="font-semibold text-lg">4. User Responsibilities</h3>
          <p>
            You are responsible for maintaining the confidentiality of your account information, including your password. You agree to notify us immediately of any unauthorized use of your account.
          </p>
          
          <h3 className="font-semibold text-lg">5. Limitation of Liability</h3>
          <p>
            To the fullest extent permitted by law, Oriango MicroFinance shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues.
          </p>
          
          <h3 className="font-semibold text-lg">6. Governing Law</h3>
          <p>
            These Terms shall be governed by and construed in accordance with the laws of the jurisdiction in which our company is based, without regard to its conflict of law principles.
          </p>
          
          <h3 className="font-semibold text-lg">7. Changes to Terms</h3>
          <p>
            We may modify these Terms at any time. We will notify you of any changes by posting the new Terms on this page. Your continued use of our services after any such changes constitutes your acceptance of the new Terms.
          </p>

          <h3 className="font-semibold text-lg">8. Contact Us</h3>
          <p>
            If you have any questions about these Terms, please contact us at info@oriango.com.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
