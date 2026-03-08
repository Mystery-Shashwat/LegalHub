"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { useAuth } from "@/store/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, X, IndianRupee, Calendar, Clock, Star } from "lucide-react";
import { format } from "date-fns";
import { toast } from "react-hot-toast";
import Link from "next/link";

interface Booking {
  id: string;
  status: string;
  amount: number;
  scheduledAt: string;
  type: string;
  client: { name: string };
}

interface DashboardStats {
  pendingRequests: number;
  activeBookings: number;
  totalEarnings: number;
  avgRating: number;
}

export default function LawyerDashboardPage() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [bookingsRes, earningsRes] = await Promise.all([
          api.get("/bookings"),
          api.get("/lawyers/me/earnings").catch(() => ({ data: null })),
        ]);
        const all: Booking[] = bookingsRes.data.bookings || [];
        setBookings(all);
        setStats({
          pendingRequests: all.filter((b) => b.status === "PENDING").length,
          activeBookings: all.filter((b) => b.status === "CONFIRMED").length,
          totalEarnings: earningsRes.data?.totalEarnings ?? 0,
          avgRating: earningsRes.data?.avgRating ?? 0,
        });
      } catch {
        toast.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const pending = bookings.filter((b) => b.status === "PENDING");
  const upcoming = bookings
    .filter((b) => b.status === "CONFIRMED" && new Date(b.scheduledAt) > new Date())
    .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())
    .slice(0, 4);

  const handleDecision = async (id: string, action: "CONFIRMED" | "CANCELLED") => {
    try {
      await api.put(`/bookings/${id}/status`, { status: action });
      setBookings((prev) =>
        prev.map((b) => (b.id === id ? { ...b, status: action } : b))
      );
      setStats((prev) =>
        prev
          ? {
              ...prev,
              pendingRequests: prev.pendingRequests - 1,
              activeBookings: action === "CONFIRMED" ? prev.activeBookings + 1 : prev.activeBookings,
            }
          : prev
      );
      toast.success(action === "CONFIRMED" ? "Booking accepted!" : "Booking declined.");
    } catch {
      toast.error("Action failed. Please try again.");
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Welcome back{user?.name ? `, ${user.name.split(" ")[0]}` : ""}
        </h1>
        <p className="text-muted-foreground hidden md:block">
          Manage your case load, requests, and schedules.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-6 md:grid-cols-4">
        {loading ? (
          [...Array(4)].map((_, i) => (
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
                <CardTitle className="text-sm font-medium text-muted-foreground">Pending Requests</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold">{stats?.pendingRequests ?? 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium text-muted-foreground">Active Bookings</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold">{stats?.activeBookings ?? 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Earnings</CardTitle>
                <IndianRupee className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold">
                  ₹{(stats?.totalEarnings ?? 0).toLocaleString("en-IN")}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium text-muted-foreground">Avg Rating</CardTitle>
                <Star className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold">
                  {stats && stats.avgRating > 0 ? stats.avgRating.toFixed(1) : "—"}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-3 items-start">
        {/* Pending Requests */}
        <Card className="md:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
            <CardTitle className="text-xl">Pending Booking Requests</CardTitle>
            <Link href="/lawyer/bookings">
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
            ) : pending.length === 0 ? (
              <div className="py-10 text-center text-muted-foreground">
                <Clock className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No pending requests right now.</p>
              </div>
            ) : (
              <div className="space-y-1">
                {pending.slice(0, 5).map((b) => (
                  <div
                    key={b.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-3 border-b last:border-0"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold shrink-0">
                        {b.client.name[0]}
                      </div>
                      <div>
                        <div className="font-semibold">{b.client.name}</div>
                        <div className="text-sm text-muted-foreground flex items-center gap-1">
                          <span className="capitalize">{b.type}</span>
                          <span>·</span>
                          <span>{format(new Date(b.scheduledAt), "dd MMM, h:mm a")}</span>
                          <span>·</span>
                          <span>₹{b.amount.toLocaleString("en-IN")}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 sm:justify-end">
                      <Button size="sm" onClick={() => handleDecision(b.id, "CONFIRMED")}>
                        <Check className="w-4 h-4 mr-1 hidden sm:block" /> Accept
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleDecision(b.id, "CANCELLED")}>
                        <X className="w-4 h-4 mr-1 hidden sm:block" /> Decline
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Today's / Upcoming Schedule */}
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
              <p className="text-muted-foreground text-sm text-center py-6">No upcoming sessions.</p>
            ) : (
              upcoming.map((b) => (
                <div key={b.id} className="p-3 bg-muted/30 rounded-lg border border-transparent hover:border-border transition-colors">
                  <div className="text-sm font-semibold mb-1">{b.client.name}</div>
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
