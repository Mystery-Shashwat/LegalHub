"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "react-hot-toast";

const DAYS = [
  "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
];

// Default 9 to 5 working hours for all days except Sunday
const DEFAULT_SLOTS = DAYS.map((_, index) => ({
  dayOfWeek: index,
  startTime: "09:00",
  endTime: "17:00",
  isActive: index > 0 && index < 6 // Mon-Fri active by default
}));

type Slot = typeof DEFAULT_SLOTS[0];

export default function LawyerAvailabilityPage() {
  // user prop removed to satisfy linter
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function fetchAvailability() {
      try {
        const { data } = await api.get("/lawyers/me");
        if (data.profile && data.profile.availability?.length > 0) {
          // Map DB slots back to state
          const dbSlots = [...DEFAULT_SLOTS];
          data.profile.availability.forEach((dbSlot: Record<string, unknown>) => {
             const idx = dbSlots.findIndex(s => s.dayOfWeek === dbSlot.dayOfWeek);
             if (idx > -1) {
                 dbSlots[idx] = { ...dbSlot, isActive: Boolean(dbSlot.isActive) } as Slot;
             }
          });
          setSlots(dbSlots);
        } else {
          setSlots(DEFAULT_SLOTS);
        }
      } catch (error) {
        console.error("Error fetching availability", error);
        toast.error("Failed to load availability data");
        setSlots(DEFAULT_SLOTS);
      } finally {
        setLoading(false);
      }
    }
    fetchAvailability();
  }, []);

  const handleToggle = (index: number, checked: boolean) => {
    const newSlots = [...slots];
    newSlots[index].isActive = checked;
    setSlots(newSlots);
  };

  const handleChange = (index: number, field: "startTime" | "endTime", value: string) => {
    const newSlots = [...slots];
    newSlots[index][field] = value;
    setSlots(newSlots);
  };

  const onSave = async () => {
    try {
      setSaving(true);
      // Only send active slots to reduce payload, but we could send all and let them be isActive=false
      const payload = {
          slots: slots.map(s => ({
              ...s,
              // Backend expects ISO strings or HH:mm, keeping HH:mm for simplicity in this frontend
          }))
      };
      
      await api.put("/lawyers/me/availability", payload);
      toast.success("Availability schedule saved!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to save schedule");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Availability & Scheduling</h1>
        <p className="text-muted-foreground">Set the weekly hours you are available for client consultations.</p>
      </div>

      <div className="space-y-6">
        {slots.map((slot, index) => (
          <div key={slot.dayOfWeek} className="flex items-center space-x-4 p-4 rounded-lg border bg-card">
            <div className="flex items-center space-x-2 w-32">
              <Checkbox 
                id={`day-${index}`} 
                checked={slot.isActive} 
                onCheckedChange={(c) => handleToggle(index, !!c)} 
              />
              <Label htmlFor={`day-${index}`} className="font-medium cursor-pointer">
                {DAYS[slot.dayOfWeek]}
              </Label>
            </div>

            {slot.isActive ? (
              <div className="flex items-center space-x-4 flex-1">
                <Input 
                  type="time" 
                  value={slot.startTime} 
                  onChange={(e) => handleChange(index, "startTime", e.target.value)} 
                  className="w-32"
                />
                <span className="text-muted-foreground">to</span>
                <Input 
                  type="time" 
                  value={slot.endTime} 
                  onChange={(e) => handleChange(index, "endTime", e.target.value)} 
                  className="w-32"
                />
              </div>
            ) : (
              <div className="flex-1 text-muted-foreground text-sm pl-2">
                Unavailable
              </div>
            )}
          </div>
        ))}
        
        <div className="pt-4 border-t">
          <Button onClick={onSave} disabled={saving}>
            {saving ? "Saving..." : "Save Weekly Schedule"}
          </Button>
        </div>
      </div>
    </div>
  );
}
