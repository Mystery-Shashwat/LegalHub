"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { format } from "date-fns";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "react-hot-toast";
import { cn } from "@/lib/utils";

interface Booking {
  id: string;
  scheduledAt: string;
  durationMinutes: number;
  status: string;
  amount: number;
  client: { name: string; email: string };
  lawyer: { user: { name: string }; specializations: string[] };
  payment: { amount: number; status: string } | null;
}

const STATUS_COLORS: Record<string, string> = {
  PENDING:   "bg-yellow-100 text-yellow-800",
  CONFIRMED: "bg-blue-100 text-blue-800",
  COMPLETED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
  NO_SHOW:   "bg-gray-100 text-gray-700",
};

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("ALL");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchBookings = async (s = status, p = page) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(p), limit: "20" });
      if (s !== "ALL") params.set("status", s);
      const { data } = await api.get(`/admin/bookings?${params}`);
      setBookings(data.bookings || []);
      setTotalPages(data.pages || 1);
    } catch {
      toast.error("Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBookings(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">All Bookings</h1>
        <p className="text-muted-foreground hidden md:block">View and monitor all bookings across the platform.</p>
      </div>

      <div className="flex items-center gap-3">
        <Select value={status} onValueChange={v => { setStatus(v); setPage(1); fetchBookings(v, 1); }}>
          <SelectTrigger className="w-44"><SelectValue placeholder="Filter by status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Statuses</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="CONFIRMED">Confirmed</SelectItem>
            <SelectItem value="COMPLETED">Completed</SelectItem>
            <SelectItem value="CANCELLED">Cancelled</SelectItem>
            <SelectItem value="NO_SHOW">No Show</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Desktop Table */}
      <Card className="hidden md:block border-border/50 shadow-sm">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead>Client</TableHead>
              <TableHead>Lawyer</TableHead>
              <TableHead>Scheduled</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Payment</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={7} className="text-center py-10 text-muted-foreground">Loading…</TableCell></TableRow>
            ) : bookings.length === 0 ? (
              <TableRow><TableCell colSpan={7} className="text-center py-10 text-muted-foreground">No bookings found.</TableCell></TableRow>
            ) : bookings.map(b => (
              <TableRow key={b.id}>
                <TableCell>
                  <div className="font-medium text-sm">{b.client.name}</div>
                  <div className="text-xs text-muted-foreground">{b.client.email}</div>
                </TableCell>
                <TableCell>
                  <div className="font-medium text-sm">{b.lawyer.user.name}</div>
                  <div className="text-xs text-muted-foreground truncate max-w-[120px]">{b.lawyer.specializations.slice(0, 2).join(", ")}</div>
                </TableCell>
                <TableCell className="text-sm">{format(new Date(b.scheduledAt), "MMM d, yyyy p")}</TableCell>
                <TableCell className="text-sm">{b.durationMinutes} min</TableCell>
                <TableCell className="font-semibold text-sm">₹{b.amount}</TableCell>
                <TableCell>
                  <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold", STATUS_COLORS[b.status] || "")}>
                    {b.status}
                  </span>
                </TableCell>
                <TableCell>
                  {b.payment
                    ? <Badge variant={b.payment.status === "PAID" ? "default" : "outline"}>{b.payment.status}</Badge>
                    : <span className="text-xs text-muted-foreground">—</span>}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Mobile Cards */}
      <div className="space-y-3 md:hidden">
        {loading ? <p className="text-center py-8 text-muted-foreground">Loading…</p>
        : bookings.length === 0 ? <p className="text-center py-8 text-muted-foreground">No bookings found.</p>
        : bookings.map(b => (
          <div key={b.id} className="border rounded-lg bg-card p-4 space-y-3 shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-semibold">{b.client.name} → {b.lawyer.user.name}</p>
                <p className="text-xs text-muted-foreground">{format(new Date(b.scheduledAt), "PPP p")}</p>
              </div>
              <span className={cn("rounded-full px-2 py-0.5 text-xs font-semibold", STATUS_COLORS[b.status] || "")}>{b.status}</span>
            </div>
            <div className="flex justify-between text-sm border-t pt-2">
              <span className="text-muted-foreground">{b.durationMinutes} min • ₹{b.amount}</span>
              {b.payment && <Badge variant={b.payment.status === "PAID" ? "default" : "outline"}>{b.payment.status}</Badge>}
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => { setPage(p => p - 1); fetchBookings(status, page - 1); }}>Previous</Button>
          <span className="text-sm text-muted-foreground">Page {page} of {totalPages}</span>
          <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => { setPage(p => p + 1); fetchBookings(status, page + 1); }}>Next</Button>
        </div>
      )}
    </div>
  );
}
