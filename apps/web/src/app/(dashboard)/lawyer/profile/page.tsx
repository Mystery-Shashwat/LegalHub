"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "react-hot-toast";

const profileSchema = z.object({
  bio: z.string().min(10, "Bio must be at least 10 characters").optional(),
  hourlyRate: z.number().min(0).optional(),
  freeConsultation: z.boolean().optional(),
  freeConsultMinutes: z.number().min(0).optional(),
  languages: z.string().optional(), // We'll split this by comma
  specializations: z.string().optional(), // We'll split this by comma 
});

export default function LawyerProfilePage() {
  // user prop removed to satisfy linter
  const [loading, setLoading] = useState(true);

  const { register, handleSubmit, reset, watch, formState: { errors, isSubmitting } } = useForm({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(profileSchema) as any,
  });

  const freeConsultation = watch("freeConsultation");

  useEffect(() => {
    async function fetchProfile() {
      try {
        const { data } = await api.get("/lawyers/me");
        if (data.profile) {
          reset({
            bio: data.profile.bio || "",
            hourlyRate: data.profile.hourlyRate || 0,
            freeConsultation: data.profile.freeConsultation || false,
            freeConsultMinutes: data.profile.freeConsultMinutes || 0,
            languages: data.profile.languages?.join(", ") || "",
            specializations: data.profile.specializations?.join(", ") || "",
          });
        }
      } catch (error) {
        console.error("Error fetching profile", error);
        toast.error("Failed to load profile data");
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, [reset]);

  const onSubmit = async (values: Record<string, unknown>) => {
    try {
      // Transform comma-separated strings back to arrays
      const payload = {
        ...values,
        languages: typeof values.languages === 'string' && values.languages ? values.languages.split(",").map((s) => s.trim()) : [],
        specializations: typeof values.specializations === 'string' && values.specializations ? values.specializations.split(",").map((s) => s.trim()) : [],
      };

      await api.put("/lawyers/me", payload);
      toast.success("Profile updated successfully!");
    } catch (error: unknown) {
      console.error(error);
      toast.error("Failed to update profile");
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Public Profile</h1>
        <p className="text-muted-foreground">Manage how clients see you on LegalHub.</p>
      </div>

      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="bio">Professional Bio</Label>
          <Textarea 
            id="bio"
            placeholder="Tell clients about your experience and expertise..."
            className="min-h-[150px]"
            {...register("bio")}
          />
          {errors.bio && <p className="text-sm text-destructive">{String(errors.bio.message)}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <div className="space-y-2">
            <Label htmlFor="languages">Languages Spoken (comma separated)</Label>
            <Input 
              id="languages"
              placeholder="e.g. English, Hindi, Marathi"
              {...register("languages")}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="specializations">Specializations (comma separated)</Label>
            <Input 
              id="specializations"
              placeholder="e.g. Family Law, Corporate"
              {...register("specializations")}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="hourlyRate">Hourly Rate (₹)</Label>
            <Input 
              id="hourlyRate"
              type="number"
              {...register("hourlyRate", { valueAsNumber: true })}
            />
             {errors.hourlyRate && <p className="text-sm text-destructive">{String(errors.hourlyRate.message)}</p>}
          </div>

        </div>

         <div className="space-y-4 rounded-lg border p-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="freeConsultation"
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                {...register("freeConsultation")}
              />
              <Label htmlFor="freeConsultation" className="font-medium">
                Offer Free Initial Consultation
              </Label>
            </div>
            
            {freeConsultation && (
              <div className="space-y-2 pl-6">
                <Label htmlFor="freeConsultMinutes">Duration (Minutes)</Label>
                <Input
                  id="freeConsultMinutes"
                  type="number"
                  placeholder="e.g. 15 or 30"
                  className="max-w-[200px]"
                  {...register("freeConsultMinutes", { valueAsNumber: true })}
                />
              </div>
            )}
        </div>

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save Changes"}
        </Button>
      </form>
    </div>
  );
}
