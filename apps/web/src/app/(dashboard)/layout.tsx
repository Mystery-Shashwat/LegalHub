"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import Sidebar from "@/components/Sidebar";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu, Search, Bell, Mail, Scale } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Root as VisuallyHidden } from "@radix-ui/react-visually-hidden"
import { useState } from "react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <ProtectedRoute allowedRoles={["CLIENT", "LAWYER", "ADMIN"]}>
      <div className="flex min-h-screen flex-col md:flex-row bg-muted/30">
        
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between p-4 border-b bg-background">
          <div className="font-bold text-lg tracking-tight flex items-center gap-2">
            <Scale className="w-5 h-5 text-primary" />
            LegalHub
          </div>
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-72">
               <VisuallyHidden>
                 <SheetTitle>Dashboard Sidebar</SheetTitle>
                 <SheetDescription>Navigation links for user dashboard</SheetDescription>
               </VisuallyHidden>
               <Sidebar className="border-none" onNavClick={() => setIsMobileMenuOpen(false)} />
            </SheetContent>
          </Sheet>
        </div>

        {/* Desktop Sidebar Navigation */}
        <Sidebar className="hidden md:flex w-full md:w-64 md:min-h-screen" />
        
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 bg-muted/20">
            {/* Top Navigation */}
            <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 shadow-sm sm:px-6">
               <div className="flex flex-1 items-center gap-4">
                  <div className="relative w-full max-w-md hidden sm:block">
                     <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                     <Input type="search" placeholder="Search practice areas, lawyers, or help..." className="w-full rounded-md bg-muted/50 pl-8 lg:w-full" />
                  </div>
               </div>
               <div className="flex items-center gap-2 md:gap-4 text-muted-foreground">
                  <Button variant="ghost" size="icon" className="hidden sm:inline-flex rounded-full">
                     <Bell className="h-5 w-5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="hidden sm:inline-flex rounded-full">
                     <Mail className="h-5 w-5" />
                  </Button>
               </div>
            </header>

            {/* Content Display */}
            <main className="flex-1 p-4 md:p-8 overflow-auto">
              {children}
            </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
