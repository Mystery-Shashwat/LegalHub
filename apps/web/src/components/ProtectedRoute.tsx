'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/store/auth'

type Props = { children: React.ReactNode; allowedRoles: string[] }

export default function ProtectedRoute({ children, allowedRoles }: Props) {
  const { user } = useAuth()
  const router    = useRouter()

  useEffect(() => {
    if (!user)                              router.push('/login')
    else if (!allowedRoles.includes(user.role)) router.push('/')
  }, [user, allowedRoles, router])

  if (!user || !allowedRoles.includes(user.role)) return null
  return <>{children}</>
}
