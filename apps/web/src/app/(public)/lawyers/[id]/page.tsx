"use client"

import { useEffect, useState } from "react"
import api from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star, MapPin, Briefcase, Languages, BookOpen, GraduationCap } from "lucide-react"
import BookingCalendar from "@/components/BookingCalendar"
import { toast } from "react-hot-toast"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function LawyerProfilePage({ params }: { params: { id: string } }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

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
    <div className="container mx-auto py-8 px-4 max-w-5xl">
       <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
           
           {/* Left Sidebar - Quick Info & Booking */}
           <div className="md:col-span-1 space-y-6">
               <Card className="text-center">
                   <CardContent className="pt-6">
                       {data.profilePhotoUrl ? (
                           <div 
                               className="w-32 h-32 mx-auto rounded-full bg-cover bg-center mb-4 border shadow-sm"
                               style={{ backgroundImage: `url(${data.profilePhotoUrl})` }}
                           />
                       ) : (
                           <div className="w-32 h-32 mx-auto bg-muted rounded-full flex items-center justify-center text-4xl mb-4 shadow-sm">
                               👨‍⚖️
                           </div>
                       )}
                       <h1 className="text-2xl font-bold">{data.user?.name || "Advocate"}</h1>
                       <div className="flex items-center justify-center gap-1 mt-2 text-amber-600 font-medium">
                           <Star className="w-5 h-5 fill-amber-500" />
                           {avgRating.toFixed(1)} ({data.reviews?.length || 0} Reviews)
                       </div>
                       <p className="text-muted-foreground mt-2">{data.city || "Location unknown"}, {data.state || ""}</p>
                   </CardContent>
               </Card>

               <Card>
                   <CardContent className="p-6">
                       <div className="text-3xl font-bold text-center mb-2">₹{data.hourlyRate || 0}</div>
                       <div className="text-sm text-center text-muted-foreground mb-6">per consultation</div>
                       
                       {data.freeConsultation && (
                           <p className="text-sm text-center text-green-600 font-medium mb-4 bg-green-50 py-2 rounded">
                               Offers {data.freeConsultMinutes} min free consultation
                           </p>
                       )}

                       <BookingCalendar 
                          lawyerProfileId={data.id} 
                          hourlyRate={data.hourlyRate || 0}
                          availability={data.availability || []}
                       />
                   </CardContent>
               </Card>
           </div>

           {/* Right Content - Full Details */}
           <div className="md:col-span-2 space-y-6">
               <Card>
                   <CardHeader>
                       <CardTitle>About The Advocate</CardTitle>
                   </CardHeader>
                   <CardContent>
                       <p className="text-muted-foreground leading-relaxed">
                           {data.bio || "This lawyer has not provided a biography yet."}
                       </p>

                       <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 mt-8">
                            <div className="flex items-start gap-3">
                                <Briefcase className="w-5 h-5 text-primary mt-0.5" />
                                <div>
                                    <div className="font-medium">Experience</div>
                                    <div className="text-sm text-muted-foreground">{data.experienceYears || "Not specified"} Years</div>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <Languages className="w-5 h-5 text-primary mt-0.5" />
                                <div>
                                    <div className="font-medium">Languages</div>
                                    <div className="text-sm text-muted-foreground">
                                        {data.languages && data.languages.length > 0 ? data.languages.join(", ") : "Not specified"}
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <MapPin className="w-5 h-5 text-primary mt-0.5" />
                                <div>
                                    <div className="font-medium">Location</div>
                                    <div className="text-sm text-muted-foreground">{data.city}, {data.state}</div>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <BookOpen className="w-5 h-5 text-primary mt-0.5" />
                                <div>
                                    <div className="font-medium">Bar Council ID</div>
                                    <div className="text-sm text-muted-foreground">{data.barCouncilNumber || "Not specified"}</div>
                                </div>
                            </div>
                       </div>
                   </CardContent>
               </Card>

               {data.specializations && data.specializations.length > 0 && (
                   <Card>
                       <CardHeader>
                           <CardTitle>Specializations</CardTitle>
                       </CardHeader>
                       <CardContent>
                           <div className="flex flex-wrap gap-2">
                               {data.specializations.map((s: string) => (
                                   <Badge key={s} variant="secondary" className="px-3 py-1 text-sm">{s}</Badge>
                               ))}
                           </div>
                       </CardContent>
                   </Card>
               )}

               {/* Education Section */}
               {(data.degreeCollege || data.degreeYear) && (
                   <Card>
                       <CardHeader>
                           <CardTitle>Education</CardTitle>
                       </CardHeader>
                       <CardContent>
                            <div className="flex items-start gap-4 p-4 border rounded-lg bg-muted/20">
                                <GraduationCap className="w-8 h-8 text-primary" />
                                <div>
                                    <div className="font-semibold text-lg">{data.degreeCollege || "College not specified"}</div>
                                    <div className="text-muted-foreground">Class of {data.degreeYear || "Year not specified"}</div>
                                </div>
                            </div>
                       </CardContent>
                   </Card>
               )}
           </div>
       </div>
    </div>
  )
}
