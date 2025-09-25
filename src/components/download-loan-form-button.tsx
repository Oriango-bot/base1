
'use client';

import { useState } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Button } from '@/components/ui/button';
import { Download, Loader2 } from 'lucide-react';
import type { Loan, User } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import { format } from 'date-fns';

interface DownloadLoanFormButtonProps {
  loan: Loan;
  borrower: User;
}

export default function DownloadLoanFormButton({ loan, borrower }: DownloadLoanFormButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const generatePdf = () => {
    setIsLoading(true);

    const doc = new jsPDF();

    // Header
    doc.setFontSize(22);
    doc.text('Oriango MicroFinance', doc.internal.pageSize.getWidth() / 2, 20, { align: 'center' });
    doc.setFontSize(16);
    doc.text('Loan Application Form', doc.internal.pageSize.getWidth() / 2, 30, { align: 'center' });
    doc.setFontSize(12);
    doc.text(`Form #: ${loan.formNumber}`, doc.internal.pageSize.getWidth() / 2, 38, { align: 'center' });
    doc.setLineWidth(0.5);
    doc.line(20, 42, doc.internal.pageSize.getWidth() - 20, 42);

    // Applicant Details
    autoTable(doc, {
      startY: 50,
      head: [['Applicant Details']],
      body: [
        ['Name', borrower.name],
        ['Email', borrower.email],
        ['Phone', borrower.phone],
        ['Address', borrower.address],
        ['ID/Passport No.', loan.idNumber],
        ['Date of Birth', format(new Date(loan.dob), 'PPP')],
      ],
      theme: 'grid',
      headStyles: { fillColor: [63, 81, 181] }, // Primary color
    });

    // Employment Details
    autoTable(doc, {
      head: [['Employment / Business Information']],
      body: [
        ['Occupation', loan.occupation],
        ['Employer/Business', loan.employerName],
        ['Work Location', `${loan.workLocation} (Near ${loan.workLandmark})`],
        ['Monthly Income', formatCurrency(loan.monthlyIncome)],
        ['Source of Income', loan.sourceOfIncome === 'other' ? `Other: ${loan.sourceOfIncomeOther}` : loan.sourceOfIncome],
      ],
      theme: 'grid',
      headStyles: { fillColor: [63, 81, 181] },
    });
    
    // Loan Details
    autoTable(doc, {
      head: [['Loan Details']],
      body: [
        ['Product Type', loan.productType],
        ['Amount Requested', formatCurrency(loan.amount)],
        ['Interest Rate', `${loan.interestRate}%`],
        ['Processing Fee', formatCurrency(loan.processingFee)],
        ['Repayment Schedule', loan.repaymentSchedule],
        ['Loan Purpose', loan.loanPurpose.join(', ') + (loan.loanPurposeOther ? `, Other: ${loan.loanPurposeOther}`: '')],
      ],
      theme: 'grid',
      headStyles: { fillColor: [63, 81, 181] },
    });

    // Security Details (Collateral & Guarantors)
    const securityBody = [];
    if (loan.hasCollateral && loan.collateral.length > 0) {
        securityBody.push(['Collateral Value', formatCurrency(loan.collateralValue)]);
        loan.collateral.forEach((item, index) => {
            securityBody.push([`Collateral Item ${index + 1}`, item.description]);
        });
    } else {
        securityBody.push(['Collateral', 'None provided']);
    }

    if (loan.guarantors.length > 0) {
         loan.guarantors.forEach((g, i) => {
            securityBody.push([`Guarantor ${i+1} Name`, g.name]);
            securityBody.push([`Guarantor ${i+1} ID`, g.idNumber]);
            securityBody.push([`Guarantor ${i+1} Phone`, g.phone]);
         });
    } else {
         securityBody.push(['Guarantors', 'None provided']);
    }
     autoTable(doc, {
      head: [['Security Details']],
      body: securityBody,
      theme: 'grid',
      headStyles: { fillColor: [63, 81, 181] },
    });

    // Declaration
    doc.addPage();
    doc.setFontSize(16);
    doc.text('Declaration and Signature', 20, 20);
    doc.setFontSize(10);
    doc.text("I confirm that the information provided is true and complete. I authorize Oriango Ltd to verify it from any necessary source. I understand that false or misleading information may result in disqualification or legal action. I consent to Oriango Ltd storing and processing my data in line with applicable data protection laws. By signing below, I accept Oriango’s loan terms, including repayment obligations and applicable fees.", 20, 30, { maxWidth: doc.internal.pageSize.getWidth() - 40 });

    doc.setLineWidth(0.5);
    doc.line(20, 70, 100, 70);
    doc.text('Signature', 20, 75);

    doc.line(doc.internal.pageSize.getWidth() - 80, 70, doc.internal.pageSize.getWidth() - 20, 70);
    doc.text('Date', doc.internal.pageSize.getWidth() - 80, 75);

    doc.setFontSize(12);
    doc.text(loan.declarationSignature, 20, 68);
    doc.text(format(new Date(loan.declarationDate), 'PPP'), doc.internal.pageSize.getWidth() - 80, 68);

    doc.save(`Loan-Application-${loan.formNumber}.pdf`);
    setIsLoading(false);
  };

  return (
    <Button variant="outline" onClick={generatePdf} disabled={isLoading}>
      {isLoading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Download className="mr-2 h-4 w-4" />
      )}
      Download Form
    </Button>
  );
}
