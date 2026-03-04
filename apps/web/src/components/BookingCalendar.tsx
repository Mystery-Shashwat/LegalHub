"use client";

import { useState } from "react";
import { format, addDays, startOfToday, isSameDay } from "date-fns";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";
import { useAuth } from "@/store/auth";
import api from "@/lib/api";
import { toast } from "react-hot-toast";
import { Textarea } from "./ui/textarea";

interface BookingCalendarProps {
  lawyerProfileId: string;
  availability: { dayOfWeek: number; startTime: string; endTime: string; isActive: boolean }[]; // The Lawyer's active slots
  hourlyRate: number;
}

export default function BookingCalendar({ lawyerProfileId, availability, hourlyRate }: BookingCalendarProps) {
  const router = useRouter();
  const { user } = useAuth();
  
  const today = startOfToday();
  const next7Days = Array.from({ length: 14 }).map((_, i) => addDays(today, i));
  
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [booking, setBooking] = useState(false);

  // Helper to get time slots for a given day
  const getSlotsForDay = (date: Date) => {
    const dayOfWeek = date.getDay();
    const dayAvail = availability.find(a => a.dayOfWeek === dayOfWeek && a.isActive);
    if (!dayAvail) return [];
    
    // Simplistic slot generation: split available window into 1-hour blocks
    const slots = [];
    let current = parseInt(dayAvail.startTime.split(':')[0]);
    const end = parseInt(dayAvail.endTime.split(':')[0]);
    
    while (current < end) {
      slots.push(`${current.toString().padStart(2, '0')}:00`);
      current++;
    }
    return slots;
  };

  const handleBooking = async () => {
    if (!user) {
      toast.error("Please login as a client to book an appointment");
      router.push("/login");
      return;
    }
    if (user.role !== "CLIENT") {
      toast.error("Only clients can book appointments.");
      return;
    }
    if (!selectedDate || !selectedTime) return;

    try {
      setBooking(true);
      // Combine date and time
      const scheduledAt = new Date(selectedDate);
      const [hours, mins] = selectedTime.split(':');
      scheduledAt.setHours(parseInt(hours), parseInt(mins));

      const { data } = await api.post("/bookings", {
        lawyerProfileId,
        scheduledAt: scheduledAt.toISOString(),
        durationMinutes: 60,
        type: "video",
        clientNotes: notes
      });

      toast.success("Booking created! Redirecting to payment...");
      router.push(`/client/bookings/${data.booking.id}`);
    } catch (error) {
       console.error(error);
       toast.error("Failed to create booking");
    } finally {
      setBooking(false);
    }
  };

  const availableSlots = selectedDate ? getSlotsForDay(selectedDate) : [];

  return (
    <div className="border rounded-xl p-6 bg-card space-y-6">
      <div>
        <h3 className="text-xl font-bold mb-4">Book a Consultation</h3>
        <p className="text-muted-foreground mb-4">Rate: ₹{hourlyRate}/hr</p>
        
        <div className="flex overflow-x-auto space-x-2 pb-2">
          {next7Days.map((date) => {
            const hasSlots = getSlotsForDay(date).length > 0;
            return (
              <button
                key={date.toISOString()}
                onClick={() => setSelectedDate(date)}
                disabled={!hasSlots}
                className={`flex flex-col items-center justify-center min-w-[70px] p-2 rounded-lg border transition-colors 
                  ${!hasSlots ? 'opacity-50 cursor-not-allowed bg-muted' : 'hover:border-primary'}
                  ${selectedDate && isSameDay(date, selectedDate) ? 'bg-primary text-primary-foreground border-primary' : 'bg-background'}
                `}
              >
                <span className="text-xs uppercase font-medium">{format(date, 'EEE')}</span>
                <span className="text-xl font-bold">{format(date, 'd')}</span>
                <span className="text-xs">{format(date, 'MMM')}</span>
              </button>
            );
          })}
        </div>
      </div>

      {selectedDate && (
        <div className="space-y-4">
           <h4 className="font-semibold">Select Time</h4>
           <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
             {availableSlots.length > 0 ? (
                availableSlots.map((time) => (
                  <Button
                    key={time}
                    variant={selectedTime === time ? "default" : "outline"}
                    onClick={() => setSelectedTime(time)}
                  >
                    {time}
                  </Button>
                ))
             ) : (
                <p className="text-sm text-muted-foreground col-span-full">No slots available on this day.</p>
             )}
           </div>
        </div>
      )}

      {selectedTime && (
         <div className="space-y-4 pt-4 border-t">
           <div className="space-y-2">
             <label className="text-sm font-medium">Brief description of your legal issue (Optional)</label>
             <Textarea 
               value={notes}
               onChange={(e) => setNotes(e.target.value)}
               placeholder="Help the lawyer prepare for your consultation..."
             />
           </div>
           
           <Button className="w-full" size="lg" onClick={handleBooking} disabled={booking}>
             {booking ? "Confirming..." : `Confirm Booking • ₹${hourlyRate}`}
           </Button>
         </div>
      )}
    </div>
  );
}
