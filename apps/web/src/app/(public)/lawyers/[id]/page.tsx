"use client"

import { useEffect, useState } from "react"
import api from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star, MapPin, Briefcase, GraduationCap, MessageSquare } from "lucide-react"
import BookingCalendar from "@/components/BookingCalendar"
import { toast } from "react-hot-toast"
import Image from "next/image"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function LawyerProfilePage({ params }: { params: { id: string } }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"overview" | "reviews">("overview")

  useEffect(() => {
     async function fetchProfile() {
         try {
             // Fetch real lawyer data from the API public endpoint
             const res = await api.get(`/lawyers/${params.id}`);
             setData(res.data.lawyer);
         } catch (error) {
             console.error(error);
             toast.error("Failed to load lawyer profile");
         } finally {
             setLoading(false);
         }
     }
     fetchProfile();
  }, [params.id])

  if (loading) return <div className="container mx-auto py-12 text-center text-muted-foreground">Loading Profile...</div>
  if (!data) return <div className="container mx-auto py-12 text-center text-muted-foreground">Lawyer profile not found.</div>

  const avgRating = data.reviews && data.reviews.length > 0
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ? data.reviews.reduce((acc: number, r: any) => acc + r.rating, 0) / data.reviews.length
    : 0;

  return (
    <div className="container mx-auto py-10 px-4 max-w-6xl">
       <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
           
           {/* Left Content Pane - Profile & Details */}
           <div className="lg:col-span-2 space-y-6">
               
               {/* Hero Detail Card */}
               <Card className="overflow-hidden">
                   <CardContent className="p-0 border-b">
                       <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 p-8 bg-card">
                         {data.profilePhotoUrl ? (
                             <Image 
                                 src={data.profilePhotoUrl} 
                                 alt={data.user?.name || "Profile Photo"}
                                 width={128}
                                 height={128}
                                 unoptimized
                                 className="w-32 h-32 rounded-full object-cover border-4 border-background shadow-md"
                             />
                         ) : (
                             <div className="w-32 h-32 bg-muted rounded-full flex items-center justify-center text-5xl shadow-md border-4 border-background">
                                 👨‍⚖️
                             </div>
                         )}
                         <div className="text-center sm:text-left mt-2 flex-1">
                             <h1 className="text-3xl font-bold mb-1">{data.user?.name || "Advocate"}</h1>
                             <p className="text-muted-foreground text-lg mb-3">Lawyer • {data.city}</p>
                             <div className="flex items-center justify-center sm:justify-start gap-1 text-amber-600 font-medium">
                                 <Star className="w-5 h-5 fill-amber-500" />
                                 {avgRating.toFixed(1)} <span className="text-muted-foreground ml-1">({data.reviews?.length || 0} Reviews)</span>
                             </div>
                         </div>
                       </div>
                   </CardContent>

                   {/* Custom Tabs */}
                   <div className="flex border-b bg-muted/10 px-4 pt-2">
                       <button 
                           onClick={() => setActiveTab("overview")}
                           className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${activeTab === "overview" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
                       >
                           OVERVIEW
                       </button>
                       <button 
                           onClick={() => setActiveTab("reviews")}
                           className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${activeTab === "reviews" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
                       >
                           REVIEWS
                       </button>
                   </div>
               </Card>

               {/* Tab Content Areas */}
               {activeTab === "overview" && (
                 <div className="space-y-6 mt-6 animate-in fade-in duration-300">
                     <Card>
                         <CardHeader>
                             <CardTitle className="text-xl">Experience & Timeline</CardTitle>
                         </CardHeader>
                         <CardContent>
                             <div className="relative border-l-2 border-muted ml-3 space-y-8 pb-4">
                               <div className="relative pl-8">
                                 <div className="absolute -left-[11px] top-1 bg-primary/10 p-1 rounded-full">
                                    <Briefcase className="w-4 h-4 text-primary" />
                                 </div>
                                 <h3 className="font-semibold text-lg">Total Legal Experience</h3>
                                 <p className="text-muted-foreground mt-1">{data.experienceYears || "Not specified"} Years of dedicated practice.</p>
                               </div>
                               <div className="relative pl-8">
                                 <div className="absolute -left-[11px] top-1 bg-primary/10 p-1 rounded-full">
                                    <MessageSquare className="w-4 h-4 text-primary" />
                                 </div>
                                 <h3 className="font-semibold text-lg">About</h3>
                                 <p className="text-muted-foreground mt-1 leading-relaxed">
                                     {data.bio || "This lawyer has not provided a biography yet."}
                                 </p>
                               </div>
                             </div>
                         </CardContent>
                     </Card>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <Card>
                             <CardHeader>
                                 <CardTitle className="flex items-center gap-2 text-lg">
                                     <MapPin className="w-5 h-5 text-primary" />
                                     Location & Bar Details
                                 </CardTitle>
                             </CardHeader>
                             <CardContent className="space-y-4">
                                 <div>
                                     <div className="text-sm font-medium text-muted-foreground">Primary Location</div>
                                     <div>{data.city}, {data.state}</div>
                                 </div>
                                 <div>
                                     <div className="text-sm font-medium text-muted-foreground">Bar Council ID</div>
                                     <div>{data.barCouncilNumber || "Not specified"}</div>
                                 </div>
                                 <div>
                                     <div className="text-sm font-medium text-muted-foreground">Languages</div>
                                     <div>{data.languages?.join(", ") || "Not specified"}</div>
                                 </div>
                             </CardContent>
                         </Card>
                         
                         <Card>
                             <CardHeader>
                                 <CardTitle className="flex items-center gap-2 text-lg">
                                     <GraduationCap className="w-5 h-5 text-primary" />
                                     Education & Specializations
                                 </CardTitle>
                             </CardHeader>
                             <CardContent className="space-y-4">
                                 {(data.degreeCollege || data.degreeYear) && (
                                     <div>
                                         <div className="text-sm font-medium text-muted-foreground">Highest Degree</div>
                                         <div className="font-medium">{data.degreeCollege} <span className="text-muted-foreground font-normal">(Class of {data.degreeYear})</span></div>
                                     </div>
                                 )}
                                 <div>
                                     <div className="text-sm font-medium text-muted-foreground mb-2">Practice Areas</div>
                                     <div className="flex flex-wrap gap-2">
                                         {data.specializations?.map((s: string) => (
                                             <Badge key={s} variant="secondary">{s}</Badge>
                                         )) || "Not specified"}
                                     </div>
                                 </div>
                             </CardContent>
                         </Card>
                     </div>
                 </div>
               )}

               {activeTab === "reviews" && (
                 <div className="space-y-6 mt-6 animate-in fade-in duration-300">
                     <Card>
                       <CardHeader>
                         <CardTitle className="text-xl">Client Reviews</CardTitle>
                       </CardHeader>
                       <CardContent>
                         {data.reviews && data.reviews.length > 0 ? (
                           <div className="space-y-6">
                             {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                             {data.reviews.map((r: any) => (
                               <div key={r.id} className="border-b pb-4 last:border-0 last:pb-0">
                                 <div className="flex items-center gap-2 mb-2">
                                   <div className="font-semibold">{r.client?.name || "Anonymous Client"}</div>
                                   <div className="flex text-amber-500">
                                     {Array.from({length: r.rating}).map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
                                   </div>
                                 </div>
                                 <p className="text-muted-foreground">{r.comment || "No comment provided."}</p>
                               </div>
                             ))}
                           </div>
                         ) : (
                           <div className="text-center py-12 text-muted-foreground">
                             No reviews available for this associate yet.
                           </div>
                         )}
                       </CardContent>
                     </Card>
                 </div>
               )}
           </div>

           {/* Right Sticky Sidebar - Booking Card */}
           <div className="lg:col-span-1 sticky top-24">
               <Card className="border-primary/20 shadow-lg top-0 relative overflow-hidden">
                   <div className="absolute top-0 left-0 right-0 h-1bg-gradient-to-r from-primary/50 to-primary"></div>
                   <CardContent className="p-0 border-none">
                       <BookingCalendar 
                          lawyerProfileId={data.id} 
                          hourlyRate={data.hourlyRate || 0}
                          availability={data.availability || []}
                       />
                   </CardContent>
               </Card>
           </div>
       </div>
    </div>
  )
}
