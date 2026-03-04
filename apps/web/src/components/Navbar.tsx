"use client"

import Link from "next/link"
import { useAuth } from "@/store/auth"
import { Button } from "@/components/ui/button"
import { Menu } from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"

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
          <Link href="/blog" className="text-muted-foreground hover:text-foreground transition-colors">Blog</Link>
          <Link href="/find-lawyer" className="text-muted-foreground hover:text-foreground transition-colors">Find a Lawyer</Link>
        </nav>

        {/* Mobile Nav */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle mobile menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[250px] sm:w-[300px]">
            <nav className="flex flex-col gap-4 mt-8">
              <Link href="/how-it-works" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">How it Works</Link>
              <Link href="/blog" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Blog</Link>
              <Link href="/find-lawyer" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Find a Lawyer</Link>
            </nav>
          </SheetContent>
        </Sheet>

        <div className="flex items-center gap-2 md:gap-4">
          {user ? (
            <>
              <Link href={user.role === 'LAWYER' ? '/lawyer/dashboard' : user.role === 'ADMIN' ? '/admin/dashboard' : '/client/dashboard'}>
                <Button variant="ghost" className="hidden sm:inline-flex">Dashboard</Button>
                <Button variant="ghost" className="sm:hidden px-2">Dash</Button>
              </Link>
              <Button variant="outline" onClick={logout} className="hidden sm:inline-flex">Sign Out</Button>
            </>
          ) : (
             <>
                <Link href="/login" className="hidden sm:inline-flex">
                  <Button variant="ghost">Log In</Button>
                </Link>
                <Link href="/register">
                  <Button size="sm" className="md:size-default">Sign Up</Button>
                </Link>
             </>
          )}
        </div>
      </div>
    </header>
  )
}
