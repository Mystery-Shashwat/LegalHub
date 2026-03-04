import ProtectedRoute from "@/components/ProtectedRoute";
import Sidebar from "@/components/Sidebar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={["CLIENT", "LAWYER", "ADMIN"]}>
      <div className="flex min-h-screen flex-col md:flex-row bg-muted/30">
        
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between p-4 border-b bg-background">
          <div className="font-bold text-lg tracking-tight">Legal<span className="text-primary">Hub</span></div>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-72">
               <Sidebar className="border-none" />
            </SheetContent>
          </Sheet>
        </div>

        {/* Desktop Sidebar Navigation */}
        <Sidebar className="hidden md:flex w-full md:w-64 border-r bg-background md:min-h-screen" />
        
        {/* Main Content Area */}
        <div className="flex-1 p-4 md:p-8 overflow-auto">
          {children}
        </div>
      </div>
    </ProtectedRoute>
  );
}
