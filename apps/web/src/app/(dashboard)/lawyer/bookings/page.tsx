"use client";

import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import api from "@/lib/api";
import { format } from "date-fns";

interface Booking {
  id: string;
  client?: { name: string; email: string };
  scheduledAt: string;
  durationMinutes: number;
  status: string;
}

export default function LawyerBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBookings() {
      try {
        const { data } = await api.get("/bookings");
        setBookings(data.bookings);
      } catch (error) {
        console.error("Error fetching bookings", error);
        toast.error("Failed to load bookings");
      } finally {
        setLoading(false);
      }
    }
    fetchBookings();
  }, []);

  const updateStatus = async (id: string, newStatus: string) => {
      try {
          const { data } = await api.put(`/bookings/${id}/status`, { status: newStatus });
          setBookings(bookings.map(b => b.id === id ? data.booking : b));
          toast.success("Booking updated");
      } catch (error) {
          console.error(error);
          toast.error("Failed to update status");
      }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Manage Bookings</h1>
        <p className="text-muted-foreground">View and update your upcoming client consultations.</p>
      </div>

      <div className="rounded-md border">
        {bookings.length === 0 ? (
           <div className="p-8 text-center text-muted-foreground">No bookings found.</div>
        ) : (
             <div className="divide-y">
                {bookings.map((booking) => (
                    <div key={booking.id} className="p-4 flex flex-col sm:flex-row justify-between sm:items-center space-y-4 sm:space-y-0">
                        <div>
                            <p className="font-semibold">{booking.client?.name || "Client"}</p>
                            <p className="text-sm text-muted-foreground">
                                {format(new Date(booking.scheduledAt), "PPP p")} - {booking.durationMinutes} mins
                            </p>
                            <span className={`inline-flex items-center px-2 py-1 mt-1 rounded text-xs font-medium 
                                ${booking.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : ''}
                                ${booking.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' : ''}
                                ${booking.status === 'CANCELLED' ? 'bg-red-100 text-red-800' : ''}`}>
                                {booking.status}
                            </span>
                        </div>
                        
                        <div className="flex space-x-2">
                             {booking.status === "PENDING" && (
                                <>
                                  <Button size="sm" onClick={() => updateStatus(booking.id, "CONFIRMED")}>Accept</Button>
                                  <Button size="sm" variant="destructive" onClick={() => updateStatus(booking.id, "CANCELLED")}>Decline</Button>
                                </>
                             )}
                              {booking.status === "CONFIRMED" && (
                                  <Button size="sm" variant="outline" onClick={() => updateStatus(booking.id, "COMPLETED")}>Mark Completed</Button>
                              )}
                        </div>
                    </div>
                ))}
             </div>
        )}
      </div>
    </div>
  );
}
