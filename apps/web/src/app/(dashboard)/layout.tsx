import ProtectedRoute from "@/components/ProtectedRoute";
import Sidebar from "@/components/Sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={["CLIENT", "LAWYER", "ADMIN"]}>
      <div className="flex min-h-screen flex-col md:flex-row bg-muted/30">
        {/* Sidebar Navigation */}
        <Sidebar className="w-full md:w-64 border-r bg-background md:min-h-screen" />
        
        {/* Main Content Area */}
        <div className="flex-1 p-4 md:p-8 overflow-auto">
          {children}
        </div>
      </div>
    </ProtectedRoute>
  );
}
