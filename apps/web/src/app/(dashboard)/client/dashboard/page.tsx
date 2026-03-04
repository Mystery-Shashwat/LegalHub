"use client";

import { useAuth } from "@/store/auth";

export default function ClientDashboardPage() {
    const { user } = useAuth();
    
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Welcome back, {user?.name?.split(' ')[0]}</h1>
                <p className="text-muted-foreground">Here&apos;s a quick overview of your LegalHub activity.</p>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <div className="rounded-xl border bg-card text-card-foreground shadow p-6 flex flex-col items-center justify-center space-y-2 h-32">
                    <h3 className="font-semibold leading-none tracking-tight">Upcoming Bookings</h3>
                    <p className="text-3xl font-bold">0</p>
                </div>
                <div className="rounded-xl border bg-card text-card-foreground shadow p-6 flex flex-col items-center justify-center space-y-2 h-32">
                    <h3 className="font-semibold leading-none tracking-tight">Active Cases</h3>
                    <p className="text-3xl font-bold">0</p>
                </div>
                 <div className="rounded-xl border bg-card text-card-foreground shadow p-6 flex flex-col items-center justify-center space-y-2 h-32">
                    <h3 className="font-semibold leading-none tracking-tight">Messages</h3>
                    <p className="text-3xl font-bold">0</p>
                </div>
            </div>
            
        </div>
    );
}
