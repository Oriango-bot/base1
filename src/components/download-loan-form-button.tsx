
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
    const pageHeight = doc.internal.pageSize.getHeight();
    const pageWidth = doc.internal.pageSize.getWidth();

    // --- Header with Oriango Logo ---
    // Outer circle (primary color)
    doc.setFillColor(63, 81, 181); // --primary hsl(231 48% 48%)
    doc.circle(25, 25, 10, 'F');
    
    // Inner circle (background color - assuming light mode bg)
    doc.setFillColor(238, 238, 238); // --background hsl(0 0% 93.3%)
    doc.circle(25, 25, 7, 'F');

    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('Oriango MicroFinance', pageWidth / 2, 25, { align: 'center' });
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'normal');
    doc.text('Loan Application Form', pageWidth / 2, 35, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setTextColor(150);
    doc.text(`Form #: ${loan.formNumber}`, pageWidth / 2, 42, { align: 'center' });
    
    doc.setLineWidth(0.5);
    doc.setDrawColor(220, 220, 220); // border color
    doc.line(20, 50, pageWidth - 20, 50);

    let finalY = 55;

    // --- Applicant Details ---
    autoTable(doc, {
      startY: finalY,
      head: [['Applicant & Next of Kin Details']],
      body: [
        ['Name', borrower.name],
        ['Email', borrower.email],
        ['Phone', borrower.phone],
        ['Address', borrower.address],
        ['ID/Passport No.', loan.idNumber],
        ['Date of Birth', format(new Date(loan.dob), 'PPP')],
        ['Next of Kin Name', loan.nextOfKinName],
        ['Relationship', loan.nextOfKinRelationship],
        ['Next of Kin Contact', loan.nextOfKinContact],
      ],
      theme: 'grid',
      headStyles: { fillColor: [63, 81, 181] }, // Primary color
      didDrawPage: (data) => { finalY = data.cursor?.y || finalY; }
    });

    // --- Employment Details ---
    autoTable(doc, {
      startY: finalY,
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
      didDrawPage: (data) => { finalY = data.cursor?.y || finalY; }
    });
    
    // --- Loan Details ---
    autoTable(doc, {
      startY: finalY,
      head: [['Loan Details']],
      body: [
        ['Product Type', loan.productType],
        ['Amount Requested', formatCurrency(loan.amount)],
        ['Interest Rate', `${loan.interestRate}%`],
        ['Processing Fee', formatCurrency(loan.processingFee)],
        ['Repayment Schedule', loan.repaymentSchedule],
        ['Loan Purpose', loan.loanPurpose.join(', ') + (loan.loanPurposeOther ? `, Other: ${loan.loanPurposeOther}`: '')],
        ['Partner', `ID: ${loan.partnerId}`]
      ],
      theme: 'grid',
      headStyles: { fillColor: [63, 81, 181] },
      didDrawPage: (data) => { finalY = data.cursor?.y || finalY; }
    });

    // --- Security Details (Collateral & Guarantors) ---
    const securityBody = [];
    if (loan.hasCollateral && loan.collateral.length > 0) {
        securityBody.push(['Collateral Value', formatCurrency(loan.collateralValue)]);
        loan.collateral.forEach((item, index) => {
            if (item.description) securityBody.push([`Collateral Item ${index + 1}`, item.description]);
        });
    } else {
        securityBody.push(['Collateral', 'None provided']);
    }

    if (loan.guarantors.length > 0) {
         loan.guarantors.forEach((g, i) => {
            if (g.name) {
                securityBody.push([`Guarantor ${i+1} Name`, g.name]);
                securityBody.push([`Guarantor ${i+1} ID`, g.idNumber]);
                securityBody.push([`Guarantor ${i+1} Phone`, g.phone]);
            }
         });
    } else {
         securityBody.push(['Guarantors', 'None provided']);
    }
     autoTable(doc, {
      startY: finalY,
      head: [['Security Details']],
      body: securityBody,
      theme: 'grid',
      headStyles: { fillColor: [63, 81, 181] },
      didDrawPage: (data) => { finalY = data.cursor?.y || finalY; }
    });

    // --- Attachments & Declaration ---
    if (finalY > pageHeight - 100) { // Check if there's enough space for declaration
        doc.addPage();
        finalY = 20;
    }

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Attachments Checklist', 20, finalY + 10);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    let attachmentsText = `
- Copy of ID: ${loan.attachments.idCopy ? 'Yes' : 'No'}
- Proof of Income: ${loan.attachments.incomeProof ? 'Yes' : 'No'}
- Guarantor ID Copies: ${loan.attachments.guarantorIdCopies ? 'Yes' : 'No'}
- Business License: ${loan.attachments.businessLicense ? 'Yes' : 'No'}
- Passport Photo: ${loan.attachments.passportPhoto ? 'Yes' : 'No'}
    `;
    doc.text(attachmentsText, 20, finalY + 18);
    finalY += 50;


    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Declaration and Signature', 20, finalY);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    const declarationText = "I confirm that the information provided is true and complete. I authorize Oriango Ltd to verify it from any necessary source. I understand that false or misleading information may result in disqualification or legal action. I consent to Oriango Ltd storing and processing my data in line with applicable data protection laws. By signing below, I accept Oriango’s loan terms, including repayment obligations and applicable fees.";
    doc.text(doc.splitTextToSize(declarationText, pageWidth - 40), 20, finalY + 8);
    finalY += 30;

    doc.setLineWidth(0.5);
    doc.setDrawColor(0);
    doc.line(20, finalY, 100, finalY);
    doc.text('Signature', 20, finalY + 5);

    doc.line(pageWidth - 80, finalY, pageWidth - 20, finalY);
    doc.text('Date', pageWidth - 80, finalY + 5);

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(loan.declarationSignature, 20, finalY - 2);
    doc.text(format(new Date(loan.declarationDate), 'PPP'), pageWidth - 80, finalY - 2);

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
