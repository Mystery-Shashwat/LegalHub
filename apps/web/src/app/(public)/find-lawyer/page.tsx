"use client"

import { useState } from "react"
import LawyerCard from "@/components/LawyerCard"
import SearchBar from "@/components/SearchBar"

// Dummy data to show UI while API is disconnected
const DUMMY_LAWYERS = [
  { id: "1", name: "Adv. Rahul Sharma", specializations: ["Criminal Law", "Bail Matters"], experienceYears: 12, city: "New Delhi", state: "Delhi", languages: ["English", "Hindi"], hourlyRate: 2000, avgRating: 4.8, totalReviews: 45, freeConsultation: true },
  { id: "2", name: "Adv. Priya Singh", specializations: ["Family Law", "Divorce"], experienceYears: 8, city: "Mumbai", state: "Maharashtra", languages: ["English", "Marathi"], hourlyRate: 1500, avgRating: 4.5, totalReviews: 22, freeConsultation: false },
  { id: "3", name: "Adv. Amit Patel", specializations: ["Corporate Law", "Startups"], experienceYears: 15, city: "Bangalore", state: "Karnataka", languages: ["English", "Kannada"], hourlyRate: 3000, avgRating: 4.9, totalReviews: 89, freeConsultation: true },
]

export default function FindLawyerPage() {
  const [query, setQuery] = useState("")

  const filtered = DUMMY_LAWYERS.filter(l => 
    l.city.toLowerCase().includes(query.toLowerCase()) || 
    l.specializations.join(" ").toLowerCase().includes(query.toLowerCase()) ||
    l.name.toLowerCase().includes(query.toLowerCase())
  )

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
               {query ? `Search results for "${query}"` : "Recommended Lawyers"}
           </h2>
           <span className="text-muted-foreground">{filtered.length} results</span>
        </div>

        <div className="grid grid-cols-1 gap-6">
            {filtered.map(lawyer => (
                <LawyerCard key={lawyer.id} data={lawyer} />
            ))}
            
            {filtered.length === 0 && (
                <div className="text-center py-20 text-muted-foreground">
                    No lawyers found matching your criteria. Try adjusting your search.
                </div>
            )}
        </div>
      </div>
    </div>
  )
}
