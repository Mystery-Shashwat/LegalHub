"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { useAuth } from "@/store/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, IndianRupee, FileText, Clock } from "lucide-react";
import { format } from "date-fns";
import { toast } from "react-hot-toast";
import Link from "next/link";

interface Booking {
  id: string;
  status: string;
  amount: number;
  isPaid: boolean;
  scheduledAt: string;
  type: string;
  lawyer: {
    id: string;
    user: { name: string };
    specializations: string[];
  };
}

interface DashboardStats {
  activeCases: number;
  upcomingBookings: number;
  totalSpent: number;
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-yellow-50 text-yellow-700 border-yellow-200",
  CONFIRMED: "bg-blue-50 text-blue-700 border-blue-200",
  COMPLETED: "bg-green-50 text-green-700 border-green-200",
  CANCELLED: "bg-red-50 text-red-700 border-red-200",
};

export default function ClientDashboardPage() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/bookings")
      .then((res) => {
        const all: Booking[] = res.data.bookings || [];
        setBookings(all);
        setStats({
          activeCases: all.filter((b) => b.status === "CONFIRMED").length,
          upcomingBookings: all.filter(
            (b) => b.status === "CONFIRMED" && new Date(b.scheduledAt) > new Date()
          ).length,
          totalSpent: all
            .filter((b) => b.isPaid)
            .reduce((sum, b) => sum + b.amount, 0),
        });
      })
      .catch(() => toast.error("Failed to load dashboard data"))
      .finally(() => setLoading(false));
  }, []);

  const upcoming = bookings
    .filter((b) => b.status === "CONFIRMED" && new Date(b.scheduledAt) > new Date())
    .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())
    .slice(0, 3);

  const recent = bookings
    .sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Welcome back{user?.name ? `, ${user.name.split(" ")[0]}` : ""}
        </h1>
        <p className="text-muted-foreground hidden md:block">
          Here&apos;s a quick overview of your LegalHub activity.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        {loading ? (
          [...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="h-8 bg-muted animate-pulse rounded" />
              </CardContent>
            </Card>
          ))
        ) : (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium text-muted-foreground">Active Bookings</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold">{stats?.activeCases ?? 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium text-muted-foreground">Upcoming Sessions</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold">{stats?.upcomingBookings ?? 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Spent</CardTitle>
                <IndianRupee className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold">
                  ₹{(stats?.totalSpent ?? 0).toLocaleString("en-IN")}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-3 items-start">
        {/* Recent Bookings */}
        <Card className="md:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
            <CardTitle className="text-xl">Recent Bookings</CardTitle>
            <Link href="/client/bookings">
              <Button variant="ghost" size="sm" className="text-xs">View all</Button>
            </Link>
          </CardHeader>
          <CardContent className="pt-4">
            {loading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-14 bg-muted animate-pulse rounded-lg" />
                ))}
              </div>
            ) : recent.length === 0 ? (
              <div className="py-10 text-center text-muted-foreground">
                <FileText className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No bookings yet.</p>
                <Link href="/find-lawyer">
                  <Button variant="outline" size="sm" className="mt-3">Find a Lawyer</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-1">
                {recent.map((b) => (
                  <div
                    key={b.id}
                    className="flex items-center justify-between gap-4 py-3 border-b last:border-0"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold shrink-0">
                        {b.lawyer.user.name[0]}
                      </div>
                      <div>
                        <div className="font-semibold">{b.lawyer.user.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {b.lawyer.specializations[0] || "Lawyer"} · {format(new Date(b.scheduledAt), "dd MMM yyyy")}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-sm font-medium">₹{b.amount.toLocaleString("en-IN")}</span>
                      <Badge variant="outline" className={STATUS_COLORS[b.status] || ""}>
                        {b.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Sessions */}
        <Card className="md:col-span-1 border-primary/20 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/50 to-primary" />
          <CardHeader className="pb-4">
            <CardTitle className="text-xl">Upcoming Sessions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading ? (
              [...Array(3)].map((_, i) => (
                <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />
              ))
            ) : upcoming.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-6">
                No upcoming sessions scheduled.
              </p>
            ) : (
              upcoming.map((b) => (
                <div
                  key={b.id}
                  className="p-3 bg-muted/30 rounded-lg border border-transparent hover:border-border transition-colors"
                >
                  <div className="text-sm font-semibold mb-1">{b.lawyer.user.name}</div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{format(new Date(b.scheduledAt), "dd MMM, h:mm a")}</span>
                    <Badge variant="secondary" className="font-normal capitalize">{b.type}</Badge>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
