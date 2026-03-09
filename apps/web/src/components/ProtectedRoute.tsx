'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/store/auth'

type Props = { children: React.ReactNode; allowedRoles: string[] }

export default function ProtectedRoute({ children, allowedRoles }: Props) {
  const { user, _hasHydrated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Wait until Zustand has finished reading from sessionStorage
    // before making any redirect decisions, to prevent reload → /login flashes
    if (!_hasHydrated) return

    if (!user) router.push('/login')
    else if (!allowedRoles.includes(user.role)) router.push('/')
  }, [user, _hasHydrated, allowedRoles, router])

  // While hydrating, show nothing (avoids flash)
  if (!_hasHydrated) return null

  if (!user || !allowedRoles.includes(user.role)) return null
  return <>{children}</>
}
