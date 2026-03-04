"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { toast } from "react-hot-toast";
import { format } from "date-fns";
import api from "@/lib/api";
import PaymentModal from "@/components/PaymentModal";

interface Booking {
  id: string;
  lawyer: { user: { name: string; email: string } };
  scheduledAt: string;
  durationMinutes: number;
  status: string;
  amount: number;
}

export default function ClientBookingConfirmationPage() {
  const params = useParams();
  const id = params?.id as string;
  
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBooking() {
      try {
        const { data } = await api.get(`/bookings`); // Alternatively, create a GET /bookings/:id
        // Filter out the specific booking from the list since we don't have a single GET
        const found = data.bookings.find((b: Booking) => b.id === id);
        if (found) {
            setBooking(found);
        } else {
            toast.error("Booking not found");
        }
      } catch (error) {
        console.error("Error fetching booking", error);
        toast.error("Failed to load booking details");
      } finally {
        setLoading(false);
      }
    }
    
    if (id) fetchBooking();
  }, [id]);

  const handlePaymentSuccess = () => {
    // Optionally refetch booking or transition state locally
    setBooking(prev => prev ? { ...prev, status: "CONFIRMED" } : null);
  };

  if (loading) return <div>Loading...</div>;
  if (!booking) return <div>Booking not found</div>;

  return (
    <div className="max-w-2xl mx-auto space-y-8 p-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Booking Confirmation</h1>
        <p className="text-muted-foreground">Review your appointment details and complete payment.</p>
      </div>

      <div className="bg-card text-card-foreground rounded-xl border p-4 sm:p-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 border-b pb-4">
            <div>
                <p className="text-sm text-muted-foreground">Lawyer</p>
                <p className="font-semibold">{booking.lawyer.user.name}</p>
            </div>
             <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <p className="font-semibold">{booking.status}</p>
            </div>
            <div>
                <p className="text-sm text-muted-foreground">Date & Time</p>
                <p className="font-semibold">{format(new Date(booking.scheduledAt), "PPP p")}</p>
            </div>
            <div>
                <p className="text-sm text-muted-foreground">Duration</p>
                <p className="font-semibold">{booking.durationMinutes} Minutes</p>
            </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-between sm:items-center pt-2 gap-4 sm:gap-0">
            <div>
                <p className="text-sm text-muted-foreground">Total Amount</p>
                <p className="text-2xl font-bold">₹{booking.amount}</p>
            </div>
            
            {booking.status === "PENDING" ? (
                <PaymentModal 
                   bookingId={booking.id} 
                   amount={booking.amount} 
                   onSuccess={handlePaymentSuccess} 
                />
            ) : (
                <span className="text-sm font-medium text-green-600 bg-green-50 px-3 py-1 rounded">
                   Payment Completed
                </span>
            )}
        </div>
      </div>
    </div>
  );
}
