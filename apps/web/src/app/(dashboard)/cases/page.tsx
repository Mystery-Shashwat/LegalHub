"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { useAuth } from "@/store/auth";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { toast } from "react-hot-toast";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function CasesListPage() {
  const { user } = useAuth();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [cases, setCases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCases() {
      try {
        const { data } = await api.get("/cases");
        setCases(data.cases);
      } catch (error) {
        console.error(error);
        toast.error("Failed to load cases.");
      } finally {
        setLoading(false);
      }
    }
    if (user) loadCases();
  }, [user]);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Cases</h1>
        <p className="text-muted-foreground">Manage ongoing and past legal matters.</p>
      </div>

      {cases.length === 0 ? (
        <Card>
          <CardContent className="py-12 flex flex-col items-center text-center text-muted-foreground">
            <p>You have no active cases.</p>
            {user?.role === "LAWYER" ? (
                <p className="text-sm mt-2">Cases are created from confirmed bookings.</p>
            ) : (
                <Link href="/find-lawyer" className="text-primary hover:underline mt-2">
                    Browse Lawyers to get started
                </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {cases.map((c) => (
            <Link key={c.id} href={`/cases/${c.id}`}>
              <Card className="hover:border-primary transition-colors cursor-pointer h-full flex flex-col">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-xl">{c.title}</CardTitle>
                    <Badge variant={c.status === "CLOSED" ? "secondary" : "default"}>
                        {c.status}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Area: {c.practiceArea}
                  </div>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col justify-end">
                    <div className="text-sm mt-4">
                        <span className="font-medium">
                            {user?.role === "CLIENT" ? "Lawyer: " : "Client: "}
                        </span>
                        {user?.role === "CLIENT" ? c.lawyer.user.name : c.booking?.client?.name || "Unknown"}
                    </div>
                    <div className="text-xs text-muted-foreground mt-2">
                        Last updated {format(new Date(c.updatedAt), "PPp")}
                    </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
