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
import { useAuth } from "@/store/auth"
import { Scale } from "lucide-react"

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
})

type LoginForm = z.infer<typeof loginSchema>

export default function LoginPage() {
  const router = useRouter()
  const { login } = useAuth()
  const [isLoading, setIsLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema)
  })

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true)
    try {
      const redirectTo = await login(data.email, data.password)
      toast.success("Successfully logged in!")
      router.push(redirectTo)
    } catch (err: unknown) {
      if (err instanceof AxiosError && err.response) {
          toast.error(err.response.data?.error || "Failed to login. Please check your credentials.");
      } else if (err instanceof Error) {
          toast.error(err.message || "Failed to login. Please check your credentials.");
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
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center shadow-inner">
              <Scale className="w-6 h-6 text-primary" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold tracking-tight text-foreground">Welcome back</CardTitle>
          <CardDescription className="text-base text-muted-foreground">
            Sign in to your LegalHub account
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="font-semibold">Email Address</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="m@example.com" 
                className="h-12 bg-background"
                {...register("email")}
              />
              {errors.email && <p className="text-sm text-destructive font-medium">{errors.email.message}</p>}
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="font-semibold">Password</Label>
                <Link href="/forgot-password" className="text-sm font-medium text-primary hover:text-primary/80 transition-colors">
                  Forgot password?
                </Link>
              </div>
              <Input 
                id="password" 
                type="password" 
                className="h-12 bg-background"
                {...register("password")}
              />
              {errors.password && <p className="text-sm text-destructive font-medium">{errors.password.message}</p>}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-6 pb-8">
            <Button className="w-full h-12 text-base font-semibold shadow-md hover:shadow-lg transition-all" type="submit" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
            <div className="text-center text-sm text-muted-foreground">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="text-primary hover:underline font-medium">
                Sign up
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
