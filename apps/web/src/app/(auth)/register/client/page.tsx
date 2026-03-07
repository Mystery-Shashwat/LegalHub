"use client"

import { useState } from "react"
import Link from "next/link"
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
import api from "@/lib/api"

const clientSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().regex(/^[6-9]\d{9}$/, "Must be a valid 10-digit Indian phone number starting with 6-9"),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
})

type ClientForm = z.infer<typeof clientSchema>

export default function RegisterClientPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<ClientForm>({
    resolver: zodResolver(clientSchema)
  })

  const onSubmit = async (data: ClientForm) => {
    setIsLoading(true)
    try {
      await api.post('/auth/register/client', data)
      toast.success("Account created successfully! Please log in.")
      router.push('/login')
    } catch (err: unknown) {
      if (err instanceof AxiosError && err.response) {
          toast.error(err.response.data?.error || "Failed to create account. Please try again.");
      } else if (err instanceof Error) {
          toast.error(err.message || "Failed to create account. Please try again.");
      } else {
          toast.error("An unexpected error occurred.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-muted/20 relative overflow-hidden">
        {/* Decorative background element */}
        <div className="absolute top-0 left-0 w-full h-96 bg-primary/5 -skew-y-6 transform origin-top-left -z-10" />
        
        <Card className="w-full max-w-md shadow-2xl border-border/50 bg-card/95 backdrop-blur-sm">
            <CardHeader className="space-y-1 text-center pb-6 pt-8">
            <CardTitle className="text-3xl font-bold tracking-tight text-foreground">Create Client Account</CardTitle>
            <CardDescription className="text-base text-muted-foreground">
                Find and book the right lawyer for your needs
            </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit(onSubmit)}>
            <CardContent className="space-y-5">
                <div className="space-y-2">
                <Label htmlFor="name" className="font-semibold">Full Name</Label>
                <Input id="name" placeholder="John Doe" className="h-12 bg-background" {...register("name")} />
                {errors.name && <p className="text-sm text-destructive font-medium">{errors.name.message}</p>}
                </div>

                <div className="space-y-2">
                <Label htmlFor="email" className="font-semibold">Email Address</Label>
                <Input id="email" type="email" placeholder="john@example.com" className="h-12 bg-background" {...register("email")} />
                {errors.email && <p className="text-sm text-destructive font-medium">{errors.email.message}</p>}
                </div>

                <div className="space-y-2">
                <Label htmlFor="phone" className="font-semibold">Phone Number</Label>
                <Input id="phone" type="tel" placeholder="9876543210" className="h-12 bg-background" {...register("phone")} />
                {errors.phone && <p className="text-sm text-destructive font-medium">{errors.phone.message}</p>}
                </div>

                <div className="space-y-2">
                <Label htmlFor="password" className="font-semibold">Password</Label>
                <Input id="password" type="password" placeholder="••••••••" className="h-12 bg-background" {...register("password")} />
                {errors.password && <p className="text-sm text-destructive font-medium">{errors.password.message}</p>}
                </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-6 pb-8">
                <Button className="w-full h-12 text-base font-semibold shadow-md hover:shadow-lg transition-all" type="submit" disabled={isLoading}>
                {isLoading ? "Creating Account..." : "Sign Up"}
                </Button>
                <div className="text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link href="/login" className="text-primary hover:underline font-bold">
                    Sign in
                </Link>
                </div>
            </CardFooter>
            </form>
        </Card>
    </div>
  )
}
