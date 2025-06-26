'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PlusCircle, Loader2, ArrowLeft } from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from '@/hooks/use-toast';
import { createLoan } from '@/app/actions';
import type { User } from '@/lib/types';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { Checkbox } from './ui/checkbox';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Form, FormField, FormItem, FormControl, FormLabel } from '@/components/ui/form';


const loanSchema = z.object({
  // Step 1
  idNumber: z.string().min(5, 'A valid ID/Passport number is required.'),
  dob: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Invalid date format." }),
  nextOfKinName: z.string().min(2, 'Next of kin name is required.'),
  nextOfKinRelationship: z.string().min(2, 'Relationship is required.'),
  nextOfKinContact: z.string().min(10, 'A valid contact is required.'),
  
  // Step 2
  occupation: z.string().min(2, 'Occupation is required.'),
  employerName: z.string().min(2, 'Employer/Business name is required.'),
  workLocation: z.string().min(2, 'Work location is required.'),
  workLandmark: z.string().min(2, 'Nearest landmark is required.'),
  monthlyIncome: z.coerce.number().positive('Monthly income is required.'),
  sourceOfIncome: z.enum(['salary', 'business', 'farming', 'other']),
  sourceOfIncomeOther: z.string().optional(),
  
  // Step 3
  productType: z.enum(['biz-flex', 'hustle-flex', 'rent-flex']),
  amount: z.coerce.number().positive({ message: 'Amount must be positive.' }),
  loanPurpose: z.array(z.string()).refine((value) => value.some((item) => item), { message: "You have to select at least one purpose." }),
  loanPurposeOther: z.string().optional(),
  repaymentSchedule: z.enum(['daily', 'weekly', 'bi-weekly', 'monthly']),
  
  // Step 4
  hasCollateral: z.boolean().default(false),
  collateral1: z.string().optional(),
  collateral2: z.string().optional(),
  collateral3: z.string().optional(),
  collateralValue: z.coerce.number().optional(),
  guarantor1Name: z.string().optional(),
  guarantor1Id: z.string().optional(),
  guarantor1Phone: z.string().optional(),

  // Step 5
  attachments_idCopy: z.boolean().default(false),
  attachments_incomeProof: z.boolean().default(false),
  attachments_guarantorIdCopies: z.boolean().default(false),
  attachments_businessLicense: z.boolean().default(false),
  attachments_passportPhoto: z.boolean().default(false),
  declarationSignature: z.string().min(1, "Signature is required to agree to terms."),
});

type LoanFormValues = z.infer<typeof loanSchema>;

interface CreateLoanDialogProps {
    borrowerId: string;
    canApply?: boolean;
}

const loanPurposes = [
    { id: 'stock', label: 'Stock Purchase' },
    { id: 'refurbishment', label: 'Refurbishment' },
    { id: 'rent', label: 'Rent' },
    { id: 'expansion', label: 'Expansion' },
]

export default function CreateLoanDialog({ borrowerId, canApply = true }: CreateLoanDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [step, setStep] = useState(1);
  const router = useRouter();

  const form = useForm<LoanFormValues>({
    resolver: zodResolver(loanSchema),
    defaultValues: {
      loanPurpose: [],
      repaymentSchedule: 'monthly',
      hasCollateral: false,
    },
  });

  useEffect(() => {
    const storedUser = localStorage.getItem('loggedInUser');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setCurrentUser(parsedUser);
      form.setValue('declarationSignature', parsedUser.name);
    }
  }, [open, form]);

  const { control, register, handleSubmit, formState: { errors }, trigger } = form;

  const onSubmit = async (data: LoanFormValues) => {
    if (!currentUser) {
      toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in to create a loan.' });
      return;
    }
    setIsLoading(true);
    
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
            value.forEach(item => formData.append(key, item.toString()));
        } else {
            formData.append(key, value.toString());
        }
      }
    });

    formData.append('borrowerId', borrowerId);
    formData.append('createdBy', currentUser.id);

    const result = await createLoan(formData);
    setIsLoading(false);

    if (result.success) {
      toast({
        title: 'Loan Application Submitted',
        description: `Your application is now pending review.`,
      });
      form.reset();
      setStep(1);
      setOpen(false);
      router.refresh(); 
    } else {
       toast({
        variant: 'destructive',
        title: 'Application Failed',
        description: result.error || 'An unknown error occurred.',
      });
    }
  };

  const nextStep = async () => {
    let fields: (keyof LoanFormValues)[] = [];
    if (step === 1) fields = ['idNumber', 'dob', 'nextOfKinName', 'nextOfKinRelationship', 'nextOfKinContact'];
    if (step === 2) fields = ['occupation', 'employerName', 'workLocation', 'workLandmark', 'monthlyIncome', 'sourceOfIncome'];
    if (step === 3) fields = ['productType', 'amount', 'loanPurpose', 'repaymentSchedule'];
    if (step === 4) fields = ['hasCollateral'];
    
    const isValid = await trigger(fields);
    if (isValid) {
      setStep(s => s + 1);
    }
  }
  const prevStep = () => setStep(s => s - 1);

  const TriggerButton = (
    <Button disabled={!canApply}>
      <PlusCircle className="mr-2 h-4 w-4" />
      Apply for Loan
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <TooltipProvider>
        <Tooltip>
            <TooltipTrigger asChild>
                {canApply ? <DialogTrigger asChild>{TriggerButton}</DialogTrigger> : <div>{TriggerButton}</div>}
            </TooltipTrigger>
            {!canApply && (
                <TooltipContent>
                    <p>You have an ongoing loan application. Please wait until it is resolved.</p>
                </TooltipContent>
            )}
        </Tooltip>
      </TooltipProvider>

      <DialogContent className="sm:max-w-3xl">
        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle>New Loan Application (Step {step} of 5)</DialogTitle>
              <DialogDescription>
                Please fill out all sections of the form accurately.
              </DialogDescription>
            </DialogHeader>
            
            <div className="py-4 space-y-4 max-h-[60vh] overflow-y-auto pr-6">
              {step === 1 && (
                  <section className="space-y-4">
                      <h3 className="font-semibold">1. Applicant Details</h3>
                      <div className="grid grid-cols-2 gap-4">
                          <div><Label htmlFor="idNumber">ID/Passport Number</Label><Input id="idNumber" {...register('idNumber')} />{errors.idNumber && <p className="text-destructive text-xs mt-1">{errors.idNumber.message}</p>}</div>
                          <div><Label htmlFor="dob">Date of Birth</Label><Input id="dob" type="date" {...register('dob')} />{errors.dob && <p className="text-destructive text-xs mt-1">{errors.dob.message}</p>}</div>
                          <div><Label htmlFor="nextOfKinName">Next of Kin Name</Label><Input id="nextOfKinName" {...register('nextOfKinName')} />{errors.nextOfKinName && <p className="text-destructive text-xs mt-1">{errors.nextOfKinName.message}</p>}</div>
                          <div><Label htmlFor="nextOfKinRelationship">Relationship</Label><Input id="nextOfKinRelationship" {...register('nextOfKinRelationship')} />{errors.nextOfKinRelationship && <p className="text-destructive text-xs mt-1">{errors.nextOfKinRelationship.message}</p>}</div>
                          <div><Label htmlFor="nextOfKinContact">Next of Kin Contact</Label><Input id="nextOfKinContact" {...register('nextOfKinContact')} />{errors.nextOfKinContact && <p className="text-destructive text-xs mt-1">{errors.nextOfKinContact.message}</p>}</div>
                      </div>
                  </section>
              )}
              {step === 2 && (
                  <section className="space-y-4">
                       <h3 className="font-semibold">2. Employment / Business Information</h3>
                       <div className="grid grid-cols-2 gap-4">
                          <div><Label htmlFor="occupation">Occupation / Business Type</Label><Input id="occupation" {...register('occupation')} />{errors.occupation && <p className="text-destructive text-xs mt-1">{errors.occupation.message}</p>}</div>
                          <div><Label htmlFor="employerName">Employer / Business Name</Label><Input id="employerName" {...register('employerName')} />{errors.employerName && <p className="text-destructive text-xs mt-1">{errors.employerName.message}</p>}</div>
                          <div><Label htmlFor="workLocation">Work Location</Label><Input id="workLocation" {...register('workLocation')} />{errors.workLocation && <p className="text-destructive text-xs mt-1">{errors.workLocation.message}</p>}</div>
                          <div><Label htmlFor="workLandmark">Nearest Landmark</Label><Input id="workLandmark" {...register('workLandmark')} />{errors.workLandmark && <p className="text-destructive text-xs mt-1">{errors.workLandmark.message}</p>}</div>
                          <div><Label htmlFor="monthlyIncome">Monthly Income (KES)</Label><Input type="number" id="monthlyIncome" {...register('monthlyIncome')} />{errors.monthlyIncome && <p className="text-destructive text-xs mt-1">{errors.monthlyIncome.message}</p>}</div>
                       </div>
                       <Controller
                          name="sourceOfIncome"
                          control={control}
                          render={({ field }) => (
                              <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex gap-4">
                                  <Label>Source of Income:</Label>
                                  <div className="flex items-center space-x-2"><RadioGroupItem value="salary" id="salary" /><Label htmlFor="salary">Salary</Label></div>
                                  <div className="flex items-center space-x-2"><RadioGroupItem value="business" id="business" /><Label htmlFor="business">Business</Label></div>
                                  <div className="flex items-center space-x-2"><RadioGroupItem value="farming" id="farming" /><Label htmlFor="farming">Farming</Label></div>
                                  <div className="flex items-center space-x-2"><RadioGroupItem value="other" id="other" /><Label htmlFor="other">Other</Label></div>
                              </RadioGroup>
                          )}
                      />
                      {errors.sourceOfIncome && <p className="text-destructive text-xs mt-1">{errors.sourceOfIncome.message}</p>}
                  </section>
              )}
              {step === 3 && (
                   <section className="space-y-4">
                      <h3 className="font-semibold">3. Loan Details</h3>
                      <div className="grid grid-cols-2 gap-4">
                          <Controller name="productType" control={control} render={({ field }) => (
                              <div><Label>Loan Product Type</Label><Select onValueChange={field.onChange} defaultValue={field.value}><SelectTrigger><SelectValue placeholder="Select Product" /></SelectTrigger><SelectContent><SelectItem value="biz-flex">Biz Flex</SelectItem><SelectItem value="hustle-flex">Hustle Flex</SelectItem><SelectItem value="rent-flex">Rent Flex</SelectItem></SelectContent></Select>{errors.productType && <p className="text-destructive text-xs mt-1">{errors.productType.message}</p>}</div>
                          )}/>
                          <div><Label>Loan Amount Requested (KES)</Label><Input type="number" {...register('amount')} />{errors.amount && <p className="text-destructive text-xs mt-1">{errors.amount.message}</p>}</div>
                           <Controller name="repaymentSchedule" control={control} render={({ field }) => (
                              <div><Label>Repayment Period</Label><Select onValueChange={field.onChange} defaultValue={field.value}><SelectTrigger><SelectValue placeholder="Select Period" /></SelectTrigger><SelectContent><SelectItem value="daily">Daily</SelectItem><SelectItem value="weekly">Weekly</SelectItem><SelectItem value="bi-weekly">Every 2 Weeks</SelectItem><SelectItem value="monthly">Monthly</SelectItem></SelectContent></Select>{errors.repaymentSchedule && <p className="text-destructive text-xs mt-1">{errors.repaymentSchedule.message}</p>}</div>
                          )}/>
                      </div>
                      <div>
                          <Label>Loan Purpose</Label>
                          <div className="flex flex-wrap gap-4 mt-2">
                               {loanPurposes.map(purpose => (
                                  <FormField key={purpose.id} control={control} name="loanPurpose" render={({ field }) => (
                                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                          <FormControl>
                                              <Checkbox
                                                  checked={field.value?.includes(purpose.id)}
                                                  onCheckedChange={(checked) => {
                                                      return checked
                                                          ? field.onChange([...(field.value || []), purpose.id])
                                                          : field.onChange(field.value?.filter((value) => value !== purpose.id))
                                                  }}
                                              />
                                          </FormControl>
                                          <FormLabel className="font-normal">{purpose.label}</FormLabel>
                                      </FormItem>
                                  )}/>
                               ))}
                          </div>
                          {errors.loanPurpose && <p className="text-destructive text-xs mt-1">{errors.loanPurpose.message}</p>}
                      </div>
                   </section>
              )}
              {step === 4 && (
                  <section className="space-y-4">
                      <h3 className="font-semibold">4. Security / Guarantors</h3>
                      <div className="flex items-center space-x-2">
                          <Checkbox id="hasCollateral" {...register('hasCollateral')} />
                          <Label htmlFor="hasCollateral">Are you providing collateral?</Label>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                          <div><Label>Collateral 1</Label><Input {...register('collateral1')} /></div>
                          <div><Label>Collateral 2</Label><Input {...register('collateral2')} /></div>
                          <div><Label>Collateral 3</Label><Input {...register('collateral3')} /></div>
                          <div><Label>Estimated Value (KES)</Label><Input type="number" {...register('collateralValue')} /></div>
                      </div>
                      <h4 className="font-medium pt-4">Guarantor 1</h4>
                       <div className="grid grid-cols-2 gap-4">
                          <div><Label>Full Name</Label><Input {...register('guarantor1Name')} /></div>
                          <div><Label>ID No</Label><Input {...register('guarantor1Id')} /></div>
                          <div><Label>Phone Number</Label><Input {...register('guarantor1Phone')} /></div>
                      </div>
                  </section>
              )}
               {step === 5 && (
                  <section className="space-y-4">
                      <h3 className="font-semibold">5. Required Attachments & Declaration</h3>
                      <p className="text-sm text-muted-foreground">Please confirm you have the following documents ready. You will be asked to provide them upon request.</p>
                       <div className="space-y-2">
                          <div className="flex items-center space-x-2"><Checkbox id="attachments_idCopy" {...register('attachments_idCopy')} /><Label htmlFor="attachments_idCopy">Copy of ID</Label></div>
                          <div className="flex items-center space-x-2"><Checkbox id="attachments_incomeProof" {...register('attachments_incomeProof')} /><Label htmlFor="attachments_incomeProof">Proof of Income</Label></div>
                          <div className="flex items-center space-x-2"><Checkbox id="attachments_guarantorIdCopies" {...register('attachments_guarantorIdCopies')} /><Label htmlFor="attachments_guarantorIdCopies">Guarantor ID Copies</Label></div>
                          <div className="flex items-center space-x-2"><Checkbox id="attachments_businessLicense" {...register('attachments_businessLicense')} /><Label htmlFor="attachments_businessLicense">Business License (if applicable)</Label></div>
                          <div className="flex items-center space-x-2"><Checkbox id="attachments_passportPhoto" {...register('attachments_passportPhoto')} /><Label htmlFor="attachments_passportPhoto">Passport Photo</Label></div>
                      </div>
                      <div className="pt-4 space-y-2">
                           <h4 className="font-medium">Declaration & Consent</h4>
                           <p className="text-xs text-muted-foreground p-2 border rounded-md">I confirm that the information provided is true and complete. I authorize Oriango Ltd to verify it from any necessary source. I understand that false or misleading information may result in disqualification or legal action. I consent to Oriango Ltd storing and processing my data in line with applicable data protection laws. By signing below, I accept Oriango’s loan terms, including repayment obligations and applicable fees.</p>
                           <Label htmlFor="declarationSignature">Type your full name to sign</Label>
                           <Input id="declarationSignature" {...register('declarationSignature')} />
                           {errors.declarationSignature && <p className="text-destructive text-xs mt-1">{errors.declarationSignature.message}</p>}
                      </div>
                  </section>
               )}
            </div>

            <DialogFooter className="pt-4">
              {step > 1 && <Button type="button" variant="ghost" onClick={prevStep} disabled={isLoading}><ArrowLeft className="mr-2"/> Back</Button>}
              <div className="flex-grow"></div>
              {step < 5 && <Button type="button" onClick={nextStep} disabled={isLoading}>Next</Button>}
              {step === 5 && <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Submit Application
              </Button>}
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
