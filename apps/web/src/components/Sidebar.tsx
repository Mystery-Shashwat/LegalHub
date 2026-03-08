"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/store/auth";
import { cn } from "@/lib/utils";
import { 
  BarChart3, 
  Calendar, 
  User, 
  Clock, 
  FileText, 
  MessageSquare,
  Settings,
  LogOut,
  Scale,
  ShoppingCart,
  Gift,
  IndianRupee,
  TrendingUp
} from "lucide-react";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";

type SidebarProps = React.HTMLAttributes<HTMLDivElement> & {
  onNavClick?: () => void;
};

export default function Sidebar({ className, onNavClick }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    if (onNavClick) onNavClick();
    router.push("/login");
  };

  if (!user) return null;

  const lawyerLinks = [
    { title: "Dashboard", href: "/lawyer/dashboard", icon: BarChart3 },
    { title: "Bookings", href: "/lawyer/bookings", icon: Calendar },
    { title: "Availability", href: "/lawyer/availability", icon: Clock },
    { title: "Profile", href: "/lawyer/profile", icon: User },
    { title: "Earnings", href: "/lawyer/earnings", icon: IndianRupee },
    { title: "Analytics", href: "/lawyer/analytics", icon: TrendingUp },
    { title: "Cases", href: "/cases", icon: FileText },
    { title: "Messages", href: "/messages", icon: MessageSquare },
    { title: "Q&A Forum", href: "/forum", icon: MessageSquare },
    { title: "Templates", href: "/templates", icon: FileText },
    { title: "Settings", href: "/settings", icon: Settings },
  ];


  const clientLinks = [
    { title: "Dashboard", href: "/client/dashboard", icon: BarChart3 },
    { title: "My Bookings", href: "/client/bookings", icon: Calendar },
    { title: "My Cases", href: "/cases", icon: FileText },
    { title: "Messages", href: "/messages", icon: MessageSquare },
    { title: "Q&A Forum", href: "/forum", icon: MessageSquare },
    { title: "RTI Tool", href: "/rti", icon: FileText },
    { title: "Templates", href: "/templates", icon: ShoppingCart },
    { title: "My Purchases", href: "/client/purchases", icon: FileText },
    { title: "Refer & Earn", href: "/referrals", icon: Gift },
    { title: "Settings", href: "/settings", icon: Settings },
  ];

  const adminLinks = [
    { title: "Dashboard", href: "/admin/dashboard", icon: BarChart3 },
    { title: "Lawyers", href: "/admin/lawyers", icon: User },
    { title: "Clients", href: "/admin/clients", icon: User },
    { title: "Disputes", href: "/admin/disputes", icon: MessageSquare },
    { title: "Settings", href: "/settings", icon: Settings },
  ];

  const links = user.role === "ADMIN" ? adminLinks : user.role === "LAWYER" ? lawyerLinks : clientLinks;

  return (
    <div className={cn("pb-12 h-full flex flex-col bg-sidebar text-sidebar-foreground", className)}>
      <div className="space-y-4 py-4 flex-1">
        <div className="px-3 py-2">
          {/* Brand Logo */}
          <div className="mb-8 px-4 flex items-center h-10">
            <Link href="/" className="text-xl font-bold tracking-tight flex items-center gap-2 transition-opacity hover:opacity-80">
              <Scale className="w-6 h-6 text-primary" />
              LegalHub
            </Link>
          </div>
          <h2 className="mb-2 px-4 text-xs font-semibold tracking-wider text-sidebar-accent-foreground/50 uppercase">
            Menu
          </h2>
          <div className="space-y-1">
            {links.map((link) => {
              const isActive = pathname.startsWith(link.href);
              return (
                <Button
                  key={link.href}
                  variant={isActive ? "default" : "ghost"}
                  className={cn(
                    "w-full justify-start",
                    isActive 
                      ? "bg-primary text-primary-foreground hover:bg-primary/90" 
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  )}
                  asChild
                >
                  <Link href={link.href} onClick={() => { if (onNavClick) onNavClick(); }}>
                    <link.icon className="mr-3 h-4 w-4" />
                    {link.title}
                  </Link>
                </Button>
              )
            })}
          </div>
        </div>
      </div>
      <div className="p-4 mt-auto">
        <div className="mb-4 px-4 text-sm text-muted-foreground break-all">
          <p className="font-medium text-foreground">{user.name}</p>
          <p>{user.email}</p>
        </div>
        <Button variant="ghost" className="w-full justify-start text-sidebar-foreground/70 hover:text-destructive hover:bg-destructive/20" onClick={handleLogout}>
            <LogOut className="mr-3 h-4 w-4" />
            Logout
        </Button>
      </div>
    </div>
  );
}
