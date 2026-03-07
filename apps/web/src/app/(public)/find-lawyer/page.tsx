"use client"

import { useState, useEffect } from "react"
import LawyerCard from "@/components/LawyerCard"
import SearchBar from "@/components/SearchBar"
import api from "@/lib/api"
import { toast } from "react-hot-toast"
import { Briefcase, Building2, Gavel, Scale, FileText, Heart, Globe, Shield } from "lucide-react"

const PRACTICE_AREAS = [
  { id: "family", label: "Family Law", icon: Heart },
  { id: "real-estate", label: "Real Estate", icon: Building2 },
  { id: "criminal", label: "Criminal Law", icon: Gavel },
  { id: "corporate", label: "Corporate Law", icon: Briefcase },
  { id: "immigration", label: "Immigration", icon: Globe },
  { id: "civil", label: "Civil Rights", icon: Scale },
  { id: "ip", label: "Intellectual Property", icon: FileText },
  { id: "personal-injury", label: "Personal Injury", icon: Shield },
];

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
    }, 500);
    
    return () => clearTimeout(timer);
  }, [query])

  return (
    <div className="min-h-screen bg-muted/10">
      {/* Premium UI Hero Section */}
      <div className="bg-background border-b py-20 px-4">
        <div className="container mx-auto text-center max-w-4xl pt-8">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6 text-foreground">
            Find Trusted Legal Counsel
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            Find a practice area and/or professional to securely handle your legal needs.
          </p>
          <SearchBar onSearch={setQuery} />
        </div>
      </div>

      {/* Practice Area Interactive Grid */}
      {!query && (
        <div className="container mx-auto py-16 px-4 max-w-5xl">
          <h2 className="text-2xl font-bold mb-8">Practice Area Grid</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {PRACTICE_AREAS.map((area) => (
              <button 
                key={area.id}
                onClick={() => setQuery(area.label)}
                className="flex flex-col items-center justify-center p-6 bg-card border rounded-xl shadow-sm hover:shadow-md hover:border-primary transition-all group"
              >
                <div className="p-3 bg-primary/5 rounded-full mb-4 group-hover:bg-primary/10 transition-colors">
                  <area.icon className="w-8 h-8 text-primary/80 group-hover:text-primary" />
                </div>
                <span className="font-semibold text-foreground/90">{area.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Search Results Area */}
      <div className="container mx-auto pb-20 pt-10 px-4 max-w-5xl">
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
