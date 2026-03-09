"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "react-hot-toast"
import { AxiosError } from "axios"
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"
import api from "@/lib/api"

// Legal specializations based on Indian legal practice areas
const SPECIALIZATIONS = [
  "Criminal Law",
  "Civil Law",
  "Family Law & Matrimonial Disputes",
  "Corporate & Commercial Law",
  "Property & Real Estate Law",
  "Labour & Employment Law",
  "Intellectual Property Law",
  "Tax Law & GST",
  "Banking & Finance Law",
  "Constitutional Law",
  "Environmental Law",
  "Consumer Protection Law",
  "Cyber & IT Law",
  "Immigration & Visa Law",
  "Arbitration & Mediation",
  "Insolvency & Bankruptcy Law",
  "Medical & Healthcare Law",
  "Insurance Law",
  "Motor Accident Claims",
  "Human Rights Law",
]

const lawyerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().regex(/^[6-9]\d{9}$/, "Must be a valid 10-digit Indian phone number starting with 6-9"),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  referralCode: z.string().optional(),
  barCouncilNumber: z.string().min(3, "Bar council number is required"),
  barCouncilState: z.string().min(2, "Bar council state is required"),
  enrollmentYear: z.string().min(4, "Enrollment date is required")
    .transform(val => new Date(val).getFullYear())
    .pipe(z.number().min(1950).max(new Date().getFullYear())),
  courtsOfPractice: z.string().min(2, "Comma-separated courts required"),
  experienceYears: z.coerce.number().int().min(0, "Must be 0 or more"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  languages: z.string().min(2, "Comma-separated languages required"),
  hourlyRate: z.coerce.number().min(100, "Minimum rate is ₹100"),
  bio: z.string().max(500, "Bio max 500 characters").optional(),
  degreeCollege: z.string().optional(),
  degreeYear: z.union([
    z.string().length(0).transform(() => undefined),
    z.string().min(4).transform(val => new Date(val).getFullYear()).pipe(z.number().int())
  ]).optional(),
  freeConsultation: z.boolean().default(false),
  freeConsultMinutes: z.coerce.number().default(0),
  linkedinUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  websiteUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  profilePhotoUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  certificateOfPracticeUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  degreeDocumentUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  govtIdUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
})

type LawyerForm = z.infer<typeof lawyerSchema>

export default function RegisterLawyerPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedSpecializations, setSelectedSpecializations] = useState<string[]>([])
  const [specError, setSpecError] = useState("")

  const { register, handleSubmit, formState: { errors }, watch, setValue, trigger } = useForm<Record<string, unknown>>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(lawyerSchema) as any,
    defaultValues: {
        freeConsultation: false,
        freeConsultMinutes: 0
    }
  })

  const toggleSpecialization = (spec: string) => {
    setSelectedSpecializations(prev => {
      if (prev.includes(spec)) return prev.filter(s => s !== spec)
      if (prev.length >= 5) {
        toast.error("You can select up to 5 specializations")
        return prev
      }
      return [...prev, spec]
    })
    setSpecError("")
  }

  const handleNextStep = async () => {
    let fieldsToValidate: string[] = []
    if (step === 1) {
       fieldsToValidate = ['name', 'email', 'phone', 'password']
    } else if (step === 2) {
       fieldsToValidate = ['barCouncilNumber', 'barCouncilState', 'profilePhotoUrl', 'certificateOfPracticeUrl', 'degreeDocumentUrl', 'govtIdUrl', 'enrollmentYear', 'experienceYears', 'degreeCollege', 'degreeYear']
    } else if (step === 3) {
       // Validate specializations manually
       if (selectedSpecializations.length === 0) {
         setSpecError("Please select at least one specialization")
         return
       }
       fieldsToValidate = ['courtsOfPractice', 'city', 'state', 'languages']
    }

    const isValid = await trigger(fieldsToValidate)
    if (isValid) {
       setStep(s => s + 1)
    }
  }

  const onSubmit = async (data: LawyerForm) => {
    if (selectedSpecializations.length === 0) {
      setSpecError("Please select at least one specialization")
      setStep(3)
      return
    }

    setIsLoading(true)
    try {
      const payload = {
          ...data,
          specializations: selectedSpecializations,
          courtsOfPractice: data.courtsOfPractice.split(',').map((s: string) => s.trim()).filter(Boolean),
          languages: data.languages.split(',').map((s: string) => s.trim()).filter(Boolean),
          profilePhotoUrl: data.profilePhotoUrl
      }
      const res = await api.post('/auth/register/lawyer', payload)
      toast.success(res.data?.message || "Registered successfully! Please complete verification.")
      router.push('/login')
    } catch (err: unknown) {
      if (err instanceof AxiosError && err.response) {
          toast.error(err.response.data?.error || "Failed to create account. Please check your details.")
      } else if (err instanceof Error) {
          toast.error(err.message || "Failed to create account. Please check your details.")
      } else {
          toast.error("An unexpected error occurred.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center py-12 px-4 bg-muted/20 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-[500px] bg-primary/5 -skew-y-6 transform origin-top-left -z-10" />

        <Card className="w-full max-w-2xl shadow-2xl border-border/50 bg-card/95 backdrop-blur-sm">
            <CardHeader className="space-y-1 text-center pb-6 pt-8">
            <CardTitle className="text-3xl font-bold tracking-tight text-foreground">Lawyer Registration</CardTitle>
            <CardDescription className="text-base text-muted-foreground">
                Step {step} of 4: {
                    step === 1 ? 'Personal Details' :
                    step === 2 ? 'Bar Council & Education' :
                    step === 3 ? 'Practice & Experience' : 'Rates & Bio'
                }
            </CardDescription>
            <div className="w-full bg-secondary h-2 mt-4 rounded-full overflow-hidden">
                <div
                    className="bg-primary h-full transition-all duration-300"
                    style={{ width: `${(step / 4) * 100}%` }}
                />
            </div>
            </CardHeader>

            <form onSubmit={handleSubmit(onSubmit as Parameters<typeof handleSubmit>[0])}>
            <CardContent className="space-y-4 pt-4">
                {/* STEP 1: Personal Details */}
                <div className={step === 1 ? 'block space-y-4' : 'hidden'}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Full Name</Label>
                            <Input id="name" placeholder="Adv. Jane Doe" {...register("name")} />
                            {errors.name && <p className="text-xs text-destructive">{errors.name.message as string}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email Address</Label>
                            <Input id="email" type="email" placeholder="jane@example.com" {...register("email")} />
                            {errors.email && <p className="text-xs text-destructive">{errors.email.message as string}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone Number (10 digits)</Label>
                            <Input id="phone" type="tel" placeholder="+91 9876543210" {...register("phone")} />
                            {errors.phone && <p className="text-xs text-destructive">{errors.phone.message as string}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input id="password" type="password" {...register("password")} />
                            {errors.password && <p className="text-xs text-destructive">{errors.password.message as string}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="referralCode">Referral Code (Optional)</Label>
                            <Input id="referralCode" placeholder="Enter code" {...register("referralCode")} />
                            {errors.referralCode && <p className="text-xs text-destructive">{errors.referralCode.message as string}</p>}
                        </div>
                    </div>
                </div>

                {/* STEP 2: Bar Council & Education */}
                <div className={step === 2 ? 'block space-y-4' : 'hidden'}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="barCouncilNumber">Bar Council ID</Label>
                            <Input id="barCouncilNumber" placeholder="e.g. MH/1234/2010" {...register("barCouncilNumber")} />
                            {errors.barCouncilNumber && <p className="text-xs text-destructive">{errors.barCouncilNumber.message as string}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="barCouncilState">Bar Council State</Label>
                            <Input id="barCouncilState" placeholder="e.g. Maharashtra" {...register("barCouncilState")} />
                            {errors.barCouncilState && <p className="text-xs text-destructive">{errors.barCouncilState.message as string}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="profilePhotoUrl">Profile Image URL (Optional)</Label>
                            <Input id="profilePhotoUrl" placeholder="https://..." {...register("profilePhotoUrl")} />
                            {errors.profilePhotoUrl && <p className="text-xs text-destructive">{errors.profilePhotoUrl.message as string}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="certificateOfPracticeUrl">Bar Council Certificate URL (Required for Approval)</Label>
                            <Input id="certificateOfPracticeUrl" placeholder="https://..." {...register("certificateOfPracticeUrl")} />
                            {errors.certificateOfPracticeUrl && <p className="text-xs text-destructive">{errors.certificateOfPracticeUrl.message as string}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="degreeDocumentUrl">Law Degree Document URL (Optional)</Label>
                            <Input id="degreeDocumentUrl" placeholder="https://..." {...register("degreeDocumentUrl")} />
                            {errors.degreeDocumentUrl && <p className="text-xs text-destructive">{errors.degreeDocumentUrl.message as string}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="govtIdUrl">Govt ID URL (Aadhaar/PAN) (Required for Approval)</Label>
                            <Input id="govtIdUrl" placeholder="https://..." {...register("govtIdUrl")} />
                            {errors.govtIdUrl && <p className="text-xs text-destructive">{errors.govtIdUrl.message as string}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="enrollmentYear">Enrollment Month & Year</Label>
                            <Input id="enrollmentYear" type="month" {...register("enrollmentYear")} />
                            {errors.enrollmentYear && <p className="text-xs text-destructive">{errors.enrollmentYear.message as string}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="experienceYears">Years of Experience</Label>
                            <Input id="experienceYears" type="number" placeholder="10" {...register("experienceYears")} />
                            {errors.experienceYears && <p className="text-xs text-destructive">{errors.experienceYears.message as string}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="degreeCollege">Law College (Optional)</Label>
                            <Input id="degreeCollege" placeholder="National Law University" {...register("degreeCollege")} />
                            {errors.degreeCollege && <p className="text-xs text-destructive">{errors.degreeCollege.message as string}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="degreeYear">Graduation Month & Year (Optional)</Label>
                            <Input id="degreeYear" type="month" {...register("degreeYear")} />
                            {errors.degreeYear && <p className="text-xs text-destructive">{errors.degreeYear.message as string}</p>}
                        </div>
                    </div>
                </div>

                {/* STEP 3: Practice & Experience */}
                <div className={step === 3 ? 'block space-y-5' : 'hidden'}>
                    {/* Specializations Multiselect */}
                    <div className="space-y-3">
                        <div>
                            <Label className="text-base font-semibold">Areas of Specialization <span className="text-muted-foreground font-normal">(up to 5)</span></Label>
                            <p className="text-xs text-muted-foreground mt-1">Select all the legal areas you actively practice in.</p>
                        </div>

                        {/* Selected tags */}
                        {selectedSpecializations.length > 0 && (
                            <div className="flex flex-wrap gap-2 p-3 bg-primary/5 rounded-lg border border-primary/20">
                                {selectedSpecializations.map(spec => (
                                    <Badge key={spec} variant="default" className="gap-1 pr-1 cursor-pointer" onClick={() => toggleSpecialization(spec)}>
                                        {spec}
                                        <X className="w-3 h-3" />
                                    </Badge>
                                ))}
                            </div>
                        )}

                        {/* Checkbox grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-64 overflow-y-auto border rounded-lg p-3 bg-muted/20">
                            {SPECIALIZATIONS.map(spec => (
                                <div key={spec} className="flex items-center space-x-2 p-2 rounded-md hover:bg-accent">
                                    <Checkbox
                                        id={`spec-${spec}`}
                                        checked={selectedSpecializations.includes(spec)}
                                        onCheckedChange={() => toggleSpecialization(spec)}
                                    />
                                    <label htmlFor={`spec-${spec}`} className="text-sm cursor-pointer leading-tight" onClick={(e) => e.preventDefault()}>{spec}</label>
                                </div>
                            ))}
                        </div>
                        {specError && <p className="text-xs text-destructive">{specError}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="courtsOfPractice">Courts of Practice (Comma separated)</Label>
                        <Input id="courtsOfPractice" placeholder="Supreme Court, Bombay HC" {...register("courtsOfPractice")} />
                        {errors.courtsOfPractice && <p className="text-xs text-destructive">{errors.courtsOfPractice.message as string}</p>}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="city">City</Label>
                            <Input id="city" placeholder="New Delhi" {...register("city")} />
                            {errors.city && <p className="text-xs text-destructive">{errors.city.message as string}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="state">State</Label>
                            <Input id="state" placeholder="Delhi" {...register("state")} />
                            {errors.state && <p className="text-xs text-destructive">{errors.state.message as string}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="languages">Languages (Comma sep)</Label>
                            <Input id="languages" placeholder="English, Hindi, Marathi" {...register("languages")} />
                            {errors.languages && <p className="text-xs text-destructive">{errors.languages.message as string}</p>}
                        </div>
                    </div>
                </div>

                {/* STEP 4: Rates & Bio */}
                <div className={step === 4 ? 'block space-y-4' : 'hidden'}>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="hourlyRate">Consultation Rate (₹ per hour)</Label>
                            <Input id="hourlyRate" type="number" placeholder="1500" {...register("hourlyRate")} />
                            {errors.hourlyRate && <p className="text-xs text-destructive">{errors.hourlyRate.message as string}</p>}
                        </div>
                        <div className="space-y-2 pt-8 flex items-center space-x-2">
                             <Checkbox
                                id="freeConsultation"
                                checked={watch("freeConsultation") as boolean}
                                onCheckedChange={(checked) => setValue("freeConsultation", checked)}
                            />
                            <Label htmlFor="freeConsultation">Offer Free Initial Consultation?</Label>
                        </div>
                        {!!watch("freeConsultation") && (
                            <div className="space-y-2">
                                <Label htmlFor="freeConsultMinutes">Free Consultation Duration (Mins)</Label>
                                <Input id="freeConsultMinutes" type="number" placeholder="15" {...register("freeConsultMinutes")} />
                                {errors.freeConsultMinutes && <p className="text-xs text-destructive">{errors.freeConsultMinutes.message as string}</p>}
                            </div>
                        )}
                        <div className="space-y-2">
                            <Label htmlFor="linkedinUrl">LinkedIn URL (Optional)</Label>
                            <Input id="linkedinUrl" type="url" placeholder="https://linkedin.com/in/..." {...register("linkedinUrl")} />
                            {errors.linkedinUrl && <p className="text-xs text-destructive">{errors.linkedinUrl.message as string}</p>}
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="bio">Professional Bio (Optional)</Label>
                            <Textarea id="bio" placeholder="Briefly describe your experience and practice..." className="h-24" {...register("bio")} />
                            {errors.bio && <p className="text-xs text-destructive">{errors.bio.message as string}</p>}
                        </div>
                </div>

            </CardContent>

            <CardFooter className="flex justify-between border-t pt-6 mt-4">
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => step > 1 ? setStep(step - 1) : router.push('/register')}
                >
                    Back
                </Button>

                {step < 4 ? (
                    <Button type="button" onClick={handleNextStep}>
                        Next Step
                    </Button>
                ) : (
                    <Button type="submit" onClick={() => trigger()} disabled={isLoading}>
                         {isLoading ? "Submitting..." : "Complete Registration"}
                    </Button>
                )}
            </CardFooter>
            </form>
        </Card>
    </div>
  )
}
