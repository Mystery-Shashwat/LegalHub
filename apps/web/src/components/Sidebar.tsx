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
  LogOut 
} from "lucide-react";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";

type SidebarProps = React.HTMLAttributes<HTMLDivElement>;

export default function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  if (!user) return null;

  const lawyerLinks = [
    { title: "Dashboard", href: "/lawyer/dashboard", icon: BarChart3 },
    { title: "Bookings", href: "/lawyer/bookings", icon: Calendar },
    { title: "Availability", href: "/lawyer/availability", icon: Clock },
    { title: "Profile", href: "/lawyer/profile", icon: User },
    { title: "Cases", href: "/cases", icon: FileText },
    { title: "Messages", href: "/messages", icon: MessageSquare },
    { title: "Settings", href: "/settings", icon: Settings },
  ];

  const clientLinks = [
    { title: "Dashboard", href: "/client/dashboard", icon: BarChart3 },
    { title: "My Bookings", href: "/client/bookings", icon: Calendar },
    { title: "My Cases", href: "/cases", icon: FileText },
    { title: "Messages", href: "/messages", icon: MessageSquare },
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
    <div className={cn("pb-12 h-full flex flex-col", className)}>
      <div className="space-y-4 py-4 flex-1">
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
            Menu
          </h2>
          <div className="space-y-1">
            {links.map((link) => (
              <Button
                key={link.href}
                variant={pathname.startsWith(link.href) ? "secondary" : "ghost"}
                className="w-full justify-start"
                asChild
              >
                <Link href={link.href}>
                  <link.icon className="mr-2 h-4 w-4" />
                  {link.title}
                </Link>
              </Button>
            ))}
          </div>
        </div>
      </div>
      <div className="p-4 mt-auto">
        <div className="mb-4 px-4 text-sm text-muted-foreground break-all">
          <p className="font-medium text-foreground">{user.name}</p>
          <p>{user.email}</p>
        </div>
        <Button variant="outline" className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
        </Button>
      </div>
    </div>
  );
}
