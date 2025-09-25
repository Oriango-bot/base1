

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
import { Form, FormField, FormItem, FormControl, FormLabel, FormMessage } from '@/components/ui/form';

const loanSchema = z.object({
  // Step 1
  idNumber: z.string().min(5, 'A valid ID/Passport number is required.'),
  dob: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "A valid date of birth is required." }),
  nextOfKinName: z.string().min(2, 'Next of kin name is required.'),
  nextOfKinRelationship: z.string().min(2, 'Relationship is required.'),
  nextOfKinContact: z.string().min(10, 'A valid contact is required.'),
  
  // Step 2
  occupation: z.string().min(2, 'Occupation is required.'),
  employerName: z.string().min(2, 'Employer/Business name is required.'),
  workLocation: z.string().min(2, 'Work location is required.'),
  workLandmark: z.string().min(2, 'Nearest landmark is required.'),
  monthlyIncome: z.coerce.number().positive('Monthly income is required.'),
  sourceOfIncome: z.enum(['salary', 'business', 'farming', 'other'], { required_error: 'Please select a source of income.'}),
  sourceOfIncomeOther: z.string().optional(),
  
  // Step 3
  productType: z.enum(['biz-flex', 'hustle-flex', 'rent-flex'], { required_error: 'Please select a product type.'}),
  amount: z.coerce.number().positive({ message: 'Amount must be positive.' }),
  loanPurpose: z.array(z.string()).refine((value) => value.length > 0, { message: "You have to select at least one purpose." }),
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
  attachments_idCopy: z.boolean().refine(val => val === true, {
    message: "You must confirm you have a copy of your ID.",
  }),
  attachments_incomeProof: z.boolean().default(false),
  attachments_guarantorIdCopies: z.boolean().default(false),
  attachments_businessLicense: z.boolean().default(false),
  attachments_passportPhoto: z.boolean().default(false),
  declarationSignature: z.string().min(1, "Signature is required to agree to terms."),
})
.refine(data => {
    if (data.sourceOfIncome === 'other') {
        return !!data.sourceOfIncomeOther && data.sourceOfIncomeOther.length > 2;
    }
    return true;
}, {
    message: "Please specify your other source of income.",
    path: ["sourceOfIncomeOther"],
})
.refine(data => {
    if (data.hasCollateral) {
        return !!data.collateral1 && data.collateral1.length > 2 && (data.collateralValue || 0) > 0;
    }
    return true;
}, {
    message: "Collateral item 1 and its value are required if you are providing collateral.",
    path: ["collateral1"], // You can also use ["collateralValue"]
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
    { id: 'other', label: 'Other (Specify)' },
]

export default function CreateLoanDialog({ borrowerId, canApply = true }: CreateLoanDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [step, setStep] = useState(1);
  const router = useRouter();
  
  const storageKey = `loan_form_data_${borrowerId}`;

  const getInitialValues = () => {
    if (typeof window === 'undefined') {
        return {
            loanPurpose: [],
            repaymentSchedule: 'monthly',
            hasCollateral: false,
            attachments_idCopy: false,
            attachments_incomeProof: false,
            attachments_guarantorIdCopies: false,
            attachments_businessLicense: false,
            attachments_passportPhoto: false,
        };
    }

    const savedData = localStorage.getItem(storageKey);
    const initialValues = savedData ? JSON.parse(savedData) : {
        loanPurpose: [],
        repaymentSchedule: 'monthly',
        hasCollateral: false,
        attachments_idCopy: false,
        attachments_incomeProof: false,
        attachments_guarantorIdCopies: false,
        attachments_businessLicense: false,
        attachments_passportPhoto: false,
    };
    
    // Defer setting signature until user is loaded from client-side storage
    return initialValues;
  }

  const form = useForm<LoanFormValues>({
    resolver: zodResolver(loanSchema),
    defaultValues: getInitialValues(),
    mode: 'onChange',
  });

  // Effect to load user from localStorage and set signature
  useEffect(() => {
    // This effect runs only on the client
    const storedUser = localStorage.getItem('loggedInUser');
    if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setCurrentUser(parsedUser);
        if (!form.getValues('declarationSignature')) {
           form.setValue('declarationSignature', parsedUser.name, { shouldValidate: true, shouldDirty: true });
        }
    }
  }, [form]);

  // Effect to save form data to localStorage
  useEffect(() => {
    const subscription = form.watch((value) => {
      localStorage.setItem(storageKey, JSON.stringify(value));
    });
    return () => subscription.unsubscribe();
  }, [form, storageKey]);


  const { control, register, handleSubmit, formState: { errors }, trigger, watch } = form;
  
  const watchHasCollateral = watch('hasCollateral');
  const watchSourceOfIncome = watch('sourceOfIncome');
  const watchLoanPurpose = watch('loanPurpose');

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
    formData.append('partnerId', String(currentUser.partnerId));

    const result = await createLoan(formData);
    setIsLoading(false);

    if (result.success && result.loanId) {
      toast({
        title: 'Loan Application Submitted',
        description: `Your application (ID: ${result.loanId.slice(-6)}) is now pending review.`,
      });
      localStorage.removeItem(storageKey); // Clear saved data on success
      form.reset(getInitialValues()); // Reset with initial state
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
    if (step === 2) fields = ['occupation', 'employerName', 'workLocation', 'workLandmark', 'monthlyIncome', 'sourceOfIncome', 'sourceOfIncomeOther'];
    if (step === 3) fields = ['productType', 'amount', 'loanPurpose', 'loanPurposeOther', 'repaymentSchedule'];
    if (step === 4) fields = ['hasCollateral', 'collateral1', 'collateralValue', 'guarantor1Name', 'guarantor1Id', 'guarantor1Phone'];
    
    const isValid = await trigger(fields);
    if (isValid) {
      setStep(s => s + 1);
    } else {
      toast({
        variant: "destructive",
        title: "Incomplete Step",
        description: "Please fill out all required fields before proceeding."
      })
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
                Please fill out all sections of the form accurately. Your progress is saved automatically.
              </DialogDescription>
            </DialogHeader>
            
            <div className="py-4 space-y-4 max-h-[60vh] overflow-y-auto pr-6">
              {step === 1 && (
                  <section className="space-y-4">
                      <h3 className="font-semibold">1. Applicant Details</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                            <FormItem>
                              <FormLabel>Source of Income</FormLabel>
                               <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex flex-wrap gap-4 pt-2">
                                  <div className="flex items-center space-x-2"><RadioGroupItem value="salary" id="salary" /><Label htmlFor="salary">Salary</Label></div>
                                  <div className="flex items-center space-x-2"><RadioGroupItem value="business" id="business" /><Label htmlFor="business">Business</Label></div>
                                  <div className="flex items-center space-x-2"><RadioGroupItem value="farming" id="farming" /><Label htmlFor="farming">Farming</Label></div>
                                  <div className="flex items-center space-x-2"><RadioGroupItem value="other" id="other" /><Label htmlFor="other">Other</Label></div>
                              </RadioGroup>
                              {errors.sourceOfIncome && <p className="text-destructive text-xs mt-1">{errors.sourceOfIncome.message}</p>}
                            </FormItem>
                          )}
                      />
                      {watchSourceOfIncome === 'other' && (
                        <div>
                          <Label htmlFor="sourceOfIncomeOther">Please Specify</Label>
                          <Input id="sourceOfIncomeOther" {...register('sourceOfIncomeOther')} />
                          {errors.sourceOfIncomeOther && <p className="text-destructive text-xs mt-1">{errors.sourceOfIncomeOther.message}</p>}
                        </div>
                      )}
                  </section>
              )}
              {step === 3 && (
                   <section className="space-y-4">
                      <h3 className="font-semibold">3. Loan Details</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <Controller name="productType" control={control} render={({ field }) => (
                              <FormItem><FormLabel>Loan Product Type</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><SelectTrigger><SelectValue placeholder="Select Product" /></SelectTrigger><SelectContent><SelectItem value="biz-flex">Biz Flex</SelectItem><SelectItem value="hustle-flex">Hustle Flex</SelectItem><SelectItem value="rent-flex">Rent Flex</SelectItem></SelectContent></Select>{errors.productType && <p className="text-destructive text-xs mt-1">{errors.productType.message}</p>}</FormItem>
                          )}/>
                          <div><Label>Loan Amount Requested (KES)</Label><Input type="number" {...register('amount')} />{errors.amount && <p className="text-destructive text-xs mt-1">{errors.amount.message}</p>}</div>
                           <Controller name="repaymentSchedule" control={control} render={({ field }) => (
                              <FormItem><FormLabel>Repayment Period</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><SelectTrigger><SelectValue placeholder="Select Period" /></SelectTrigger><SelectContent><SelectItem value="daily">Daily</SelectItem><SelectItem value="weekly">Weekly</SelectItem><SelectItem value="bi-weekly">Every 2 Weeks</SelectItem><SelectItem value="monthly">Monthly</SelectItem></SelectContent></Select>{errors.repaymentSchedule && <p className="text-destructive text-xs mt-1">{errors.repaymentSchedule.message}</p>}</FormItem>
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
                      {watchLoanPurpose?.includes('other') && (
                        <div>
                          <Label htmlFor="loanPurposeOther">Please specify other purpose</Label>
                          <Input id="loanPurposeOther" {...register('loanPurposeOther')} />
                          {errors.loanPurposeOther && <p className="text-destructive text-xs mt-1">{errors.loanPurposeOther.message}</p>}
                        </div>
                      )}
                   </section>
              )}
              {step === 4 && (
                  <section className="space-y-4">
                      <h3 className="font-semibold">4. Security / Guarantors</h3>
                      <div className="flex items-center space-x-2">
                          <Controller name="hasCollateral" control={control} render={({field}) => (
                              <Checkbox id="hasCollateral" checked={field.value} onCheckedChange={field.onChange} />
                          )} />
                          <Label htmlFor="hasCollateral">Are you providing collateral?</Label>
                      </div>
                      {watchHasCollateral && (
                        <div className="p-4 border rounded-md space-y-4">
                            <p className="text-sm text-muted-foreground">Please describe the collateral you are providing.</p>
                             {errors.collateral1 && <p className="text-destructive text-xs mt-1">{errors.collateral1.message}</p>}
                             {errors.collateralValue && <p className="text-destructive text-xs mt-1">{errors.collateralValue.message}</p>}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div><Label>Collateral Item 1</Label><Input {...register('collateral1')} /></div>
                                <div><Label>Collateral Item 2 (Optional)</Label><Input {...register('collateral2')} /></div>
                                <div><Label>Collateral Item 3 (Optional)</Label><Input {...register('collateral3')} /></div>
                                <div><Label>Estimated Total Value (KES)</Label><Input type="number" {...register('collateralValue')} /></div>
                            </div>
                        </div>
                      )}
                      <h4 className="font-medium pt-4">Guarantor 1 (Optional)</h4>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div><Label>Full Name</Label><Input {...register('guarantor1Name')} /></div>
                          <div><Label>ID No</Label><Input {...register('guarantor1Id')} /></div>
                          <div><Label>Phone Number</Label><Input {...register('guarantor1Phone')} /></div>
                      </div>
                  </section>
              )}
               {step === 5 && (
                  <section className="space-y-4">
                      <h3 className="font-semibold">5. Required Attachments & Declaration</h3>
                      <p className="text-sm text-muted-foreground">Please confirm you have the following documents ready. You will be asked to provide them upon request. This does not upload the files.</p>
                       <div className="space-y-2">
                          <FormField control={control} name="attachments_idCopy" render={({field}) => (
                                <FormItem className="flex items-center space-x-2"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl><Label>Copy of ID (Required)</Label></FormItem>
                          )} />
                          {errors.attachments_idCopy && <p className="text-destructive text-xs mt-1">{errors.attachments_idCopy.message}</p>}

                          <FormField control={control} name="attachments_incomeProof" render={({field}) => (
                                <FormItem className="flex items-center space-x-2"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl><Label>Proof of Income</Label></FormItem>
                          )} />
                          <FormField control={control} name="attachments_guarantorIdCopies" render={({field}) => (
                                <FormItem className="flex items-center space-x-2"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl><Label>Guarantor ID Copies</Label></FormItem>
                          )} />
                          <FormField control={control} name="attachments_businessLicense" render={({field}) => (
                                <FormItem className="flex items-center space-x-2"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl><Label>Business License (if applicable)</Label></FormItem>
                          )} />
                           <FormField control={control} name="attachments_passportPhoto" render={({field}) => (
                                <FormItem className="flex items-center space-x-2"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl><Label>Passport Photo</Label></FormItem>
                          )} />
                      </div>
                      <div className="pt-4 space-y-2">
                           <h4 className="font-medium">Declaration & Consent</h4>
                           <p className="text-xs text-muted-foreground p-2 border rounded-md">I confirm that the information provided is true and complete. I authorize Oriango Ltd to verify it from any necessary source. I understand that false or misleading information may result in disqualification or legal action. I consent to Oriango Ltd storing and processing my data in line with applicable data protection laws. By signing below, I accept Oriango’s loan terms, including repayment obligations and applicable fees.</p>
                           <Label htmlFor="declarationSignature">Signature (auto-filled)</Label>
                           <Input id="declarationSignature" {...register('declarationSignature')} readOnly className="bg-muted" />
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
    

    

