"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, Scale, CheckCircle, IndianRupee, BookOpen, AlertTriangle, Clock, TrendingUp } from "lucide-react";

interface AdminStats {
  clients: number;
  verifiedLawyers: number;
  pendingApprovals: number;
  bookings: number;
  revenue: number;
}

interface Analytics {
  users:    { total: number; thisMonth: number };
  bookings: { total: number; thisMonth: number; completed: number; cancelled: number };
  revenue:  { total: number; thisMonth: number };
  pending:  { lawyers: number; disputes: number };
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);

  useEffect(() => {
    api.get("/admin/stats").then(r => setStats(r.data.stats)).catch(console.error);
    api.get("/admin/analytics").then(r => setAnalytics(r.data)).catch(console.error);
  }, []);

  if (!stats) return <div className="p-8 text-muted-foreground">Loading Platform Metrics...</div>;

  const topCards = [
    { title: "Total Clients",       value: stats.clients,                          icon: Users },
    { title: "Verified Lawyers",     value: stats.verifiedLawyers,                  icon: Scale },
    { title: "Pending Approvals",    value: stats.pendingApprovals,                 icon: CheckCircle },
    { title: "Platform Revenue",     value: `₹${stats.revenue.toLocaleString()}`,   icon: IndianRupee },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Admin Dashboard</h1>
        <p className="text-muted-foreground hidden md:block">Platform metrics and system administration.</p>
      </div>

      {/* Top stat cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {topCards.map((c) => (
          <Card key={c.title} className="shadow-sm border-border/50 bg-card hover:shadow-md transition-all">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{c.title}</CardTitle>
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <c.icon className="h-4 w-4 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{c.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Analytics section — only shown after analytics are loaded */}
      {analytics && (
        <>
          {/* Detailed counters */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[
              { title: "New Users This Month",     value: `+${analytics.users.thisMonth}`,           icon: TrendingUp,     sub: `${analytics.users.total.toLocaleString()} total` },
              { title: "Bookings This Month",       value: `+${analytics.bookings.thisMonth}`,         icon: BookOpen,       sub: `${analytics.bookings.total.toLocaleString()} total` },
              { title: "Revenue This Month",        value: `₹${analytics.revenue.thisMonth.toLocaleString()}`, icon: IndianRupee, sub: `₹${analytics.revenue.total.toLocaleString()} total` },
              { title: "Open Disputes",             value: analytics.pending.disputes,                 icon: AlertTriangle,  sub: "Needs attention" },
            ].map(c => (
              <Card key={c.title} className="shadow-sm border-border/50 bg-card hover:shadow-md transition-all">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">{c.title}</CardTitle>
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <c.icon className="h-4 w-4 text-primary" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{c.value}</div>
                  <p className="text-xs text-muted-foreground mt-1">{c.sub}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Booking breakdown & revenue */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="shadow-sm border-border/50">
              <CardHeader>
                <CardTitle className="text-base">Booking Breakdown</CardTitle>
                <CardDescription>Status distribution across all bookings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { label: "Completed", count: analytics.bookings.completed },
                  { label: "Cancelled", count: analytics.bookings.cancelled },
                  { label: "Other",     count: analytics.bookings.total - analytics.bookings.completed - analytics.bookings.cancelled },
                ].map(row => {
                  const pct = analytics.bookings.total
                    ? Math.round((row.count / analytics.bookings.total) * 100)
                    : 0;
                  return (
                    <div key={row.label}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-muted-foreground">{row.label}</span>
                        <span className="font-medium">{row.count} ({pct}%)</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            <Card className="shadow-sm border-border/50">
              <CardHeader>
                <CardTitle className="text-base">Quick Summary</CardTitle>
                <CardDescription>Platform health at a glance</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { label: "Completion rate",   value: analytics.bookings.total ? `${Math.round((analytics.bookings.completed / analytics.bookings.total) * 100)}%` : "—" },
                  { label: "Avg. commission/booking", value: analytics.bookings.total ? `₹${Math.round(analytics.revenue.total / analytics.bookings.total).toLocaleString()}` : "—" },
                  { label: "Pending lawyer approvals", value: analytics.pending.lawyers },
                  { label: "Total users",       value: analytics.users.total.toLocaleString() },
                ].map(row => (
                  <div key={row.label} className="flex items-center justify-between py-2 border-b last:border-0">
                    <span className="text-sm text-muted-foreground">{row.label}</span>
                    <span className="text-sm font-semibold">{row.value}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Pending actions banner */}
          {(analytics.pending.lawyers > 0 || analytics.pending.disputes > 0) && (
            <div className="flex flex-col sm:flex-row gap-4">
              {analytics.pending.lawyers > 0 && (
                <div className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3 text-sm flex-1">
                  <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span><strong>{analytics.pending.lawyers}</strong> lawyer{analytics.pending.lawyers !== 1 ? "s" : ""} awaiting verification — <a href="/admin/lawyers" className="text-primary underline underline-offset-2">Review now</a></span>
                </div>
              )}
              {analytics.pending.disputes > 0 && (
                <div className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3 text-sm flex-1">
                  <AlertTriangle className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span><strong>{analytics.pending.disputes}</strong> open dispute{analytics.pending.disputes !== 1 ? "s" : ""} — <a href="/admin/disputes" className="text-primary underline underline-offset-2">Resolve now</a></span>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
