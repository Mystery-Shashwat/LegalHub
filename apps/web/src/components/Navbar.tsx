"use client"

import Link from "next/link"
import { useAuth } from "@/store/auth"
import { Button } from "@/components/ui/button"

export default function Navbar() {
  const { user, logout } = useAuth()

  return (
    <header className="border-b bg-background sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold text-primary tracking-tight">
          Legal<span className="text-foreground">Hub</span>
        </Link>
        
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <Link href="/how-it-works" className="text-muted-foreground hover:text-foreground transition-colors">How it Works</Link>
          <Link href="/find-lawyer" className="text-muted-foreground hover:text-foreground transition-colors">Find a Lawyer</Link>
        </nav>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              <Link href={user.role === 'LAWYER' ? '/lawyer/dashboard' : user.role === 'ADMIN' ? '/admin/dashboard' : '/client/dashboard'}>
                <Button variant="ghost">Dashboard</Button>
              </Link>
              <Button variant="outline" onClick={logout}>Sign Out</Button>
            </>
          ) : (
             <>
                <Link href="/login" className="hidden sm:inline-flex">
                  <Button variant="ghost">Log In</Button>
                </Link>
                <Link href="/register">
                  <Button>Sign Up</Button>
                </Link>
             </>
          )}
        </div>
      </div>
    </header>
  )
}
