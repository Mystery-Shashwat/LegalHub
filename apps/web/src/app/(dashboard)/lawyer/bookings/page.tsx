"use client";

import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import api from "@/lib/api";
import { format } from "date-fns";
import { Card } from "@/components/ui/card";
import { VideoRoom } from "@/components/VideoRoom";
import { Video, ChevronLeft } from "lucide-react";

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
  const [activeVideoUrl, setActiveVideoUrl] = useState<string | null>(null);
  const [joiningId, setJoiningId] = useState<string | null>(null);

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

  const joinVideoRoom = async (bookingId: string) => {
      setJoiningId(bookingId);
      try {
          const { data } = await api.get(`/bookings/${bookingId}/room`);
          if (data.url) {
              setActiveVideoUrl(data.url);
          } else {
              toast.error("Room URL not generated");
          }
      } catch (error) {
          console.error("Error joining video room:", error);
          const err = error as { response?: { data?: { error?: string } } };
          toast.error(err.response?.data?.error || "Could not join video room");
      } finally {
          setJoiningId(null);
      }
  };

  if (activeVideoUrl) {
       return (
          <div className="max-w-5xl mx-auto space-y-4">
               <div>
                  <Button variant="ghost" onClick={() => setActiveVideoUrl(null)} className="mb-4 -ml-4">
                      <ChevronLeft className="w-4 h-4 mr-2" /> Back to Dashboard
                  </Button>
                 <h1 className="text-2xl font-bold tracking-tight">Active Consultation</h1>
                 <p className="text-muted-foreground flex items-center gap-2">
                     <Video className="w-4 h-4 text-green-500 animate-pulse" /> Live Session
                 </p>
               </div>
               <VideoRoom url={activeVideoUrl} onLeave={() => setActiveVideoUrl(null)} />
          </div>
       );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Manage Bookings</h1>
        <p className="text-muted-foreground hidden md:block">View and update your upcoming client consultations.</p>
      </div>

      <Card className="shadow-sm border-border/50">
        {bookings.length === 0 ? (
           <div className="p-12 text-center text-muted-foreground">No bookings found.</div>
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
                                <>
                                  <Button 
                                    size="sm" 
                                    className="bg-green-600 hover:bg-green-700"
                                    onClick={() => joinVideoRoom(booking.id)}
                                    disabled={joiningId === booking.id}
                                  >
                                    <Video className="w-4 h-4 mr-2" />
                                    {joiningId === booking.id ? "Joining..." : "Join"}
                                  </Button>
                                  <Button size="sm" variant="outline" onClick={() => updateStatus(booking.id, "COMPLETED")}>
                                      Mark Completed
                                  </Button>
                                </>
                              )}
                        </div>
                    </div>
                ))}
             </div>
        )}
      </Card>
    </div>
  );
}
