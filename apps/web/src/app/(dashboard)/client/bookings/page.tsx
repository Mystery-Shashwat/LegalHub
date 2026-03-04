"use client"

import { useEffect, useState } from "react"
import api from "@/lib/api"
import { format } from "date-fns"
import Link from "next/link"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Video, FileText, IndianRupee } from "lucide-react"

interface Booking {
    id: string;
    scheduledAt: string;
    durationMinutes: number;
    status: string;
    type: string;
    amount: number;
    isPaid: boolean;
    lawyer: {
        user: {
            name: string;
            email: string;
        }
    }
}

export default function ClientBookingsPage() {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                const { data } = await api.get('/bookings');
                setBookings(data.bookings || []);
            } catch (error) {
                console.error("Failed to load bookings", error);
            } finally {
                setLoading(false);
            }
        };
        fetchBookings();
    }, []);

    if (loading) return <div className="p-8">Loading your bookings...</div>;

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "CONFIRMED": return <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-none">Confirmed</Badge>;
            case "COMPLETED": return <Badge variant="secondary">Completed</Badge>;
            case "CANCELLED": return <Badge variant="destructive">Cancelled</Badge>;
            case "PENDING": return <Badge variant="outline" className="text-amber-600 border-amber-600">Pending</Badge>;
            default: return <Badge variant="outline">{status}</Badge>;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">My Bookings</h1>
                    <p className="text-muted-foreground mt-2">View and manage your consultation appointments.</p>
                </div>
                <Link href="/find-lawyer">
                    <Button>Book New Lawyer</Button>
                </Link>
            </div>

            {/* Desktop Table View */}
            <div className="border rounded-lg bg-card hidden md:block">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Lawyer</TableHead>
                            <TableHead>Date & Time</TableHead>
                            <TableHead>Consultation Type</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {bookings.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                                    <Calendar className="w-12 h-12 mx-auto text-muted-foreground/30 mb-4" />
                                    You have no bookings yet.
                                </TableCell>
                            </TableRow>
                        ) : (
                            bookings.map((booking) => (
                                <TableRow key={booking.id}>
                                    <TableCell>
                                        <div className="font-medium">{booking.lawyer.user.name}</div>
                                        <div className="text-xs text-muted-foreground">{booking.lawyer.user.email}</div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="font-medium">
                                            {format(new Date(booking.scheduledAt), "MMM d, yyyy")}
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            {format(new Date(booking.scheduledAt), "h:mm a")} ({booking.durationMinutes} mins)
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1.5 capitalize text-muted-foreground">
                                            {booking.type === 'video' ? <Video className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                                            {booking.type}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="font-medium flex items-center">
                                            <IndianRupee className="w-3 h-3 mr-0.5" />
                                            {booking.amount}
                                        </div>
                                        {!booking.isPaid && booking.status !== "CANCELLED" && (
                                            <span className="text-[10px] text-destructive font-medium uppercase tracking-wider">Unpaid</span>
                                        )}
                                        {booking.isPaid && (
                                            <span className="text-[10px] text-green-600 font-medium uppercase tracking-wider">Paid</span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {getStatusBadge(booking.status)}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Link href={`/client/bookings/${booking.id}`}>
                                            <Button variant="outline" size="sm">
                                                {!booking.isPaid && booking.status !== "CANCELLED" ? "Pay Now" : "View Details"}
                                            </Button>
                                        </Link>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Mobile Card View */}
            <div className="grid grid-cols-1 gap-4 md:hidden">
                {bookings.length === 0 ? (
                    <div className="border rounded-lg bg-card text-center py-12 text-muted-foreground shadow-sm">
                        <Calendar className="w-12 h-12 mx-auto text-muted-foreground/30 mb-4" />
                        You have no bookings yet.
                    </div>
                ) : (
                    bookings.map((booking) => (
                        <div key={booking.id} className="border rounded-lg bg-card p-4 space-y-4 shadow-sm">
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="font-bold text-lg">{booking.lawyer.user.name}</div>
                                    <div className="text-sm text-muted-foreground">{booking.lawyer.user.email}</div>
                                </div>
                                {getStatusBadge(booking.status)}
                            </div>
                            
                            <div className="grid grid-cols-2 gap-2 text-sm">
                                <div>
                                    <div className="text-muted-foreground mb-1">Date & Time</div>
                                    <div className="font-medium">{format(new Date(booking.scheduledAt), "MMM d, yyyy")}</div>
                                    <div className="text-xs text-muted-foreground">{format(new Date(booking.scheduledAt), "h:mm a")}</div>
                                </div>
                                <div>
                                    <div className="text-muted-foreground mb-1 flex items-center gap-1">
                                       {booking.type === 'video' ? <Video className="w-3 h-3" /> : <FileText className="w-3 h-3" />}
                                       <span className="capitalize">{booking.type}</span>
                                    </div>
                                    <div className="font-medium flex items-center">
                                        <IndianRupee className="w-3 h-3 mr-0.5" /> {booking.amount}
                                    </div>
                                    {!booking.isPaid && booking.status !== "CANCELLED" && (
                                        <div className="text-[10px] text-destructive font-medium uppercase tracking-wider mt-0.5">Unpaid</div>
                                    )}
                                    {booking.isPaid && (
                                        <div className="text-[10px] text-green-600 font-medium uppercase tracking-wider mt-0.5">Paid</div>
                                    )}
                                </div>
                            </div>

                            <Link href={`/client/bookings/${booking.id}`} className="block pt-2 border-t">
                                <Button className="w-full" variant={!booking.isPaid && booking.status !== "CANCELLED" ? "default" : "outline"}>
                                    {!booking.isPaid && booking.status !== "CANCELLED" ? "Complete Payment" : "View Full Details"}
                                </Button>
                            </Link>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
