"use client";

import { useAuth } from "@/store/auth";

export default function LawyerDashboardPage() {
    const { user } = useAuth();
    
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
                <p className="text-muted-foreground">Manage your practice, bookings, and earnings.</p>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-xl border bg-card text-card-foreground shadow p-6 flex flex-col items-center justify-center space-y-2 h-32">
                    <h3 className="font-semibold leading-none tracking-tight">Pending Requests</h3>
                    <p className="text-3xl font-bold">0</p>
                </div>
                <div className="rounded-xl border bg-card text-card-foreground shadow p-6 flex flex-col items-center justify-center space-y-2 h-32">
                    <h3 className="font-semibold leading-none tracking-tight">Confirmed Today</h3>
                    <p className="text-3xl font-bold">0</p>
                </div>
                 <div className="rounded-xl border bg-card text-card-foreground shadow p-6 flex flex-col items-center justify-center space-y-2 h-32">
                    <h3 className="font-semibold leading-none tracking-tight">Active Cases</h3>
                    <p className="text-3xl font-bold">0</p>
                </div>
                <div className="rounded-xl border bg-card text-card-foreground shadow p-6 flex flex-col items-center justify-center space-y-2 h-32">
                    <h3 className="font-semibold leading-none tracking-tight">Earnings (This Mo)</h3>
                    <p className="text-3xl font-bold">₹0</p>
                </div>
            </div>
            
        </div>
    );
}
