'use client'
import { useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import api from '@/lib/api'
import toast from 'react-hot-toast'
import { AxiosError } from 'axios'
import { Lock, Eye, EyeOff, CheckCircle, Scale } from 'lucide-react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

function ResetForm() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('token')

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  if (!token) {
    return (
      <>
        <CardHeader className="space-y-1 text-center pb-4 pt-8">
          <CardTitle className="text-2xl font-bold tracking-tight text-destructive">Invalid link</CardTitle>
          <CardDescription>This reset link is invalid or missing.</CardDescription>
        </CardHeader>
        <CardFooter className="pb-8 justify-center">
          <Link href="/forgot-password" className="text-primary hover:underline text-sm font-medium">
            Request a new link →
          </Link>
        </CardFooter>
      </>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password.length < 8) return toast.error('Password must be at least 8 characters')
    if (password !== confirm) return toast.error('Passwords do not match')
    setLoading(true)
    try {
      await api.post('/auth/reset-password', { token, password })
      setDone(true)
      setTimeout(() => router.push('/login'), 3000)
    } catch (err: unknown) {
      const msg = err instanceof AxiosError ? err.response?.data?.error : undefined
      toast.error(msg || 'Reset failed. The link may have expired.')
    } finally {
      setLoading(false)
    }
  }

  if (done) {
    return (
      <>
        <CardHeader className="space-y-1 text-center pb-4 pt-8">
          <div className="flex justify-center mb-3">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">Password reset!</CardTitle>
          <CardDescription>Your password has been updated successfully.</CardDescription>
        </CardHeader>
        <CardFooter className="pb-8 justify-center">
          <p className="text-sm text-muted-foreground">Redirecting to login in 3 seconds…</p>
        </CardFooter>
      </>
    )
  }

  return (
    <form onSubmit={handleSubmit}>
      <CardHeader className="space-y-1 text-center pb-6 pt-8">
        <CardTitle className="text-3xl font-bold tracking-tight text-foreground">Set new password</CardTitle>
        <CardDescription className="text-base text-muted-foreground">
          Choose a strong password for your account.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="password" className="font-semibold">New password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="password"
              type={showPass ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Min 8 characters"
              className="h-12 bg-background pl-9 pr-10"
              required
            />
            <button
              type="button"
              onClick={() => setShowPass(!showPass)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirm" className="font-semibold">Confirm password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="confirm"
              type={showPass ? 'text' : 'password'}
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              placeholder="Repeat your password"
              className="h-12 bg-background pl-9"
              required
            />
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col space-y-4 pb-8">
        <Button className="w-full h-12 text-base font-semibold shadow-md hover:shadow-lg transition-all" type="submit" disabled={loading}>
          {loading ? 'Resetting...' : 'Reset password'}
        </Button>
        <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
          Back to login
        </Link>
      </CardFooter>
    </form>
  )
}

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-muted/20 relative overflow-hidden">
      {/* Decorative background element — same as login */}
      <div className="absolute top-0 left-0 w-full h-96 bg-primary/5 -skew-y-6 transform origin-top-left -z-10" />

      <Card className="w-full max-w-md shadow-2xl border-border/50 bg-card/95 backdrop-blur-sm">
        <div className="flex justify-center pt-8 pb-2">
          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center shadow-inner">
            <Scale className="w-6 h-6 text-primary" />
          </div>
        </div>
        <Suspense
          fallback={
            <CardContent className="py-12 text-center">
              <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto" />
            </CardContent>
          }
        >
          <ResetForm />
        </Suspense>
      </Card>
    </div>
  )
}
