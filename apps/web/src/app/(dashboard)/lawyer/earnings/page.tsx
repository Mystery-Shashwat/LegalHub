"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { useAuth } from "@/store/auth";
import { format } from "date-fns";
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { IndianRupee, Wallet } from "lucide-react";
import { toast } from "react-hot-toast";

interface Earning {
    id: string;
    amount: number;
    commissionAmount: number;
    lawyerPayout: number;
    status: string;
    createdAt: string;
    booking: {
        scheduledAt: string;
        client: { name: string }
    }
}

export default function EarningsPage() {
  const { user } = useAuth();
  const [earnings, setEarnings] = useState<Earning[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEarnings() {
      try {
        const { data } = await api.get("/payments/lawyer");
        setEarnings(data.payments);
      } catch (error) {
        console.error(error);
        toast.error("Failed to load earnings history.");
      } finally {
        setLoading(false);
      }
    }
    if (user?.role === "LAWYER") {
        fetchEarnings();
    }
  }, [user]);

  if (loading) return <div>Loading...</div>;

  const totalEarnings = earnings.reduce((sum, e) => sum + e.lawyerPayout, 0);
  const pendingClearance = earnings
    .filter(e => e.status === "PENDING")
    .reduce((sum, e) => sum + e.lawyerPayout, 0);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Earnings</h1>
        <p className="text-muted-foreground">Track your consulting revenue and payout history.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available for Payout</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalEarnings.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">Total revenue generated after 10% platform fee.</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Clearance</CardTitle>
            <IndianRupee className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">₹{pendingClearance.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">Funds from recent bookings processing.</p>
          </CardContent>
        </Card>
      </div>

      <Card>
          <CardHeader>
              <CardTitle>Transactions</CardTitle>
              <CardDescription>Recent booking payments and your 90% payout share.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Client</TableHead>
                        <TableHead>Gross Amount</TableHead>
                        <TableHead>Platform Fee (10%)</TableHead>
                        <TableHead className="text-right font-bold">Your Payout</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {earnings.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                No payment history found.
                            </TableCell>
                        </TableRow>
                    ) : (
                        earnings.map(e => (
                            <TableRow key={e.id}>
                                <TableCell>{format(new Date(e.createdAt), "MMM d, yyyy")}</TableCell>
                                <TableCell>{e.booking.client.name}</TableCell>
                                <TableCell>₹{e.amount}</TableCell>
                                <TableCell className="text-destructive">-₹{e.commissionAmount}</TableCell>
                                <TableCell className="text-right font-bold text-green-600">
                                    ₹{e.lawyerPayout}
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
          </CardContent>
      </Card>
    </div>
  );
}
