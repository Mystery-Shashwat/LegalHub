"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Scale, CheckCircle, IndianRupee } from "lucide-react";

interface AdminStats {
  clients: number;
  verifiedLawyers: number;
  pendingApprovals: number;
  bookings: number;
  revenue: number;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);

  useEffect(() => {
    async function loadStats() {
      try {
        const { data } = await api.get("/admin/stats");
        setStats(data.stats);
      } catch (error) {
        console.error("Failed to load admin stats", error);
      }
    }
    loadStats();
  }, []);

  if (!stats) return <div className="p-8">Loading Platform Metrics...</div>;

  const cards = [
    { title: "Total Clients", value: stats.clients, icon: Users },
    { title: "Verified Lawyers", value: stats.verifiedLawyers, icon: Scale },
    { title: "Pending Lawyers", value: stats.pendingApprovals, icon: CheckCircle },
    { title: "Platform Revenue", value: `₹${stats.revenue.toLocaleString()}`, icon: IndianRupee },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground">Overview of LegalHub platform activity.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <Card key={c.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{c.title}</CardTitle>
              <c.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{c.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
