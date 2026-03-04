"use client"

import { useState, useEffect } from "react"
import LawyerCard from "@/components/LawyerCard"
import SearchBar from "@/components/SearchBar"
import api from "@/lib/api"
import { toast } from "react-hot-toast"

export default function FindLawyerPage() {
  const [query, setQuery] = useState("")
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [lawyers, setLawyers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchLawyers = async () => {
      try {
        setLoading(true);
        // Note: Our backend API supports ?search= to filter names / bios.
        const endpoint = query ? `/lawyers?search=${encodeURIComponent(query)}` : "/lawyers";
        const { data } = await api.get(endpoint);
        
        // Map Prisma DB response into what LawyerCard UI expects
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const mapped = data.lawyers.map((l: any) => ({
          id: l.id,
          name: l.user?.name || "Advocate",
          specializations: l.specializations || [],
          experienceYears: l.experienceYears || 0,
          city: l.city || "Unknown City",
          state: l.state || "",
          languages: l.languages || [],
          hourlyRate: l.hourlyRate || 0,
          avgRating: l.avgRating || 0,
          totalReviews: l.totalReviews || 0,
          freeConsultation: l.freeConsultation || false
        }));
        
        setLawyers(mapped);
      } catch (error) {
        console.error("Failed to load lawyers", error);
        toast.error("Failed to load lawyers. Displaying empty state.");
      } finally {
        setLoading(false);
      }
    };
    
    // Add small debounce to avoid spamming the backend while typing
    const timer = setTimeout(() => {
        fetchLawyers();
    }, 300);
    
    return () => clearTimeout(timer);
  }, [query])

  return (
    <div className="min-h-screen bg-muted/20">
      <div className="bg-primary text-primary-foreground py-16 px-4">
        <div className="container mx-auto text-center max-w-3xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Find the Right Lawyer for Your Needs</h1>
          <p className="text-xl opacity-90 mb-8">Browse verified top-rated advocates across India.</p>
          <SearchBar onSearch={setQuery} />
        </div>
      </div>

      <div className="container mx-auto py-12 px-4 max-w-5xl">
        <div className="flex justify-between items-center mb-6">
           <h2 className="text-2xl font-semibold">
               {query ? `Search results for "${query}"` : "Verified Lawyers"}
           </h2>
           <span className="text-muted-foreground">{lawyers.length} results</span>
        </div>

        {loading ? (
            <div className="text-center py-20 text-muted-foreground">
                Finding the best advocates for you...
            </div>
        ) : (
            <div className="grid grid-cols-1 gap-6">
                {lawyers.map((lawyer) => (
                    <LawyerCard key={lawyer.id} data={lawyer} />
                ))}
                
                {lawyers.length === 0 && (
                    <div className="text-center py-20 text-muted-foreground">
                        No lawyers found matching your criteria. Try adjusting your search.
                    </div>
                )}
            </div>
        )}
      </div>
    </div>
  )
}
