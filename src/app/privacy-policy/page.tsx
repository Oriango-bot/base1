

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import Footer from '@/components/footer';
import { OriangoLogo } from '@/components/oriango-logo';

export default function PrivacyPolicyPage() {
  return (
    <>
      <div className="container mx-auto py-12 px-4 md:px-6">
        <Card>
          <CardHeader>
            <CardTitle>Privacy Policy</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className='text-sm text-muted-foreground'>Last updated: June 4, 2024</p>
            <h3 className="font-semibold text-lg">1. Introduction</h3>
            <p>
              Oriango MicroFinance (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our services.
            </p>
            <h3 className="font-semibold text-lg">2. Information We Collect</h3>
            <p>
              We may collect personal information from you, such as your name, email address, phone number, financial information, and identification documents when you apply for a loan or use our services.
            </p>
            <h3 className="font-semibold text-lg">3. How We Use Your Information</h3>
            <p>
              We use the information we collect to:
            </p>
            <ul className="list-disc list-inside space-y-1">
              <li>Process your loan applications.</li>
              <li>Manage your account.</li>
              <li>Communicate with you.</li>
              <li>Comply with legal obligations.</li>
              <li>Improve our services.</li>
            </ul>
            <h3 className="font-semibold text-lg">4. Information Sharing</h3>
            <p>
              We do not sell, trade, or otherwise transfer your personal information to outside parties except as described in this policy. We may share your information with trusted third parties who assist us in operating our website, conducting our business, or servicing you, so long as those parties agree to keep this information confidential.
            </p>
            <h3 className="font-semibold text-lg">5. Data Security</h3>
            <p>
              We implement a variety of security measures to maintain the safety of your personal information. Your personal information is contained behind secured networks and is only accessible by a limited number of persons who have special access rights to such systems.
            </p>
            <h3 className="font-semibold text-lg">6. Your Rights</h3>
            <p>
              You have the right to access, correct, or delete your personal information. You may also have the right to object to or restrict certain processing of your data.
            </p>
            <h3 className="font-semibold text-lg">7. Contact Us</h3>
            <p>
              If you have any questions about this Privacy Policy, please contact us at info@oriango.com.
            </p>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </>
  );
}

