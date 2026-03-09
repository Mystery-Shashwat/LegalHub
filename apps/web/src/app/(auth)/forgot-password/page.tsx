'use client'
import { useState } from 'react'
import Link from 'next/link'
import api from '@/lib/api'
import toast from 'react-hot-toast'
import { Mail, ArrowLeft, CheckCircle, Scale } from 'lucide-react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return toast.error('Please enter your email')
    setLoading(true)
    try {
      await api.post('/auth/forgot-password', { email })
      setSent(true)
    } catch {
      toast.error('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-muted/20 relative overflow-hidden">
      {/* Decorative background element — same as login */}
      <div className="absolute top-0 left-0 w-full h-96 bg-primary/5 -skew-y-6 transform origin-top-left -z-10" />

      <Card className="w-full max-w-md shadow-2xl border-border/50 bg-card/95 backdrop-blur-sm">
        <CardHeader className="space-y-1 text-center pb-6 pt-8">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center shadow-inner">
              <Scale className="w-6 h-6 text-primary" />
            </div>
          </div>

          {sent ? (
            <>
              <div className="flex justify-center mb-2">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>
              <CardTitle className="text-2xl font-bold tracking-tight">Check your inbox</CardTitle>
              <CardDescription className="text-base">
                If an account exists for <strong>{email}</strong>, we&apos;ve sent a password reset link.
                Check your spam folder if you don&apos;t see it.
              </CardDescription>
            </>
          ) : (
            <>
              <CardTitle className="text-3xl font-bold tracking-tight text-foreground">Forgot password?</CardTitle>
              <CardDescription className="text-base text-muted-foreground">
                Enter your email and we&apos;ll send you a reset link.
              </CardDescription>
            </>
          )}
        </CardHeader>

        {sent ? (
          <CardFooter className="flex flex-col space-y-4 pb-8">
            <p className="text-sm text-muted-foreground text-center">The link expires in 1 hour.</p>
            <Link href="/login" className="inline-flex items-center gap-2 text-primary hover:underline text-sm font-medium">
              <ArrowLeft className="w-4 h-4" /> Back to login
            </Link>
          </CardFooter>
        ) : (
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="font-semibold">Email address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="h-12 bg-background pl-9"
                    required
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-6 pb-8">
              <Button className="w-full h-12 text-base font-semibold shadow-md hover:shadow-lg transition-all" type="submit" disabled={loading}>
                {loading ? 'Sending...' : 'Send reset link'}
              </Button>
              <Link href="/login" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm transition-colors">
                <ArrowLeft className="w-4 h-4" /> Back to login
              </Link>
            </CardFooter>
          </form>
        )}
      </Card>
    </div>
  )
}
