"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star, MapPin, Briefcase, Languages, BookOpen, GraduationCap } from "lucide-react"
import BookingCalendar from "@/components/BookingCalendar"

const DUMMY_LAWYER = {
  id: "1",
  name: "Adv. Rahul Sharma",
  specializations: ["Criminal Law", "Bail Matters", "Cyber Crime"],
  experienceYears: 12,
  city: "New Delhi",
  state: "Delhi",
  languages: ["English", "Hindi", "Punjabi"],
  hourlyRate: 2000,
  avgRating: 4.8,
  totalReviews: 45,
  freeConsultation: true,
  freeConsultMinutes: 15,
  bio: "I am a dedicated criminal defense attorney with over a decade of experience in the Delhi High Court and trial courts. I specialize in white-collar crimes, bail matters, and complex litigation. My approach is client-first, ensuring transparency and aggressive representation.",
  degreeCollege: "National Law University, Delhi",
  degreeYear: 2012,
  barCouncilNumber: "D/1234/2012"
}

export default function LawyerProfilePage({ params }: { params: { id: string } }) {
  // Normally fetch data using `params.id` here
  const data = DUMMY_LAWYERS.find(l => l.id === params.id) || DUMMY_LAWYER

  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl">
       <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
           
           {/* Left Sidebar - Quick Info & Booking */}
           <div className="md:col-span-1 space-y-6">
               <Card className="text-center">
                   <CardContent className="pt-6">
                       <div className="w-32 h-32 mx-auto bg-muted rounded-full flex items-center justify-center text-4xl mb-4">
                           👨‍⚖️
                       </div>
                       <h1 className="text-2xl font-bold">{data.name}</h1>
                       <div className="flex items-center justify-center gap-1 mt-2 text-amber-600 font-medium">
                           <Star className="w-5 h-5 fill-amber-500" />
                           {data.avgRating.toFixed(1)} ({data.totalReviews} Reviews)
                       </div>
                       <p className="text-muted-foreground mt-2">{data.city}, {data.state}</p>
                   </CardContent>
               </Card>

               <Card>
                   <CardContent className="p-6">
                       <div className="text-3xl font-bold text-center mb-2">₹{data.hourlyRate}</div>
                       <div className="text-sm text-center text-muted-foreground mb-6">per consultation</div>
                       
                       {data.freeConsultation && (
                           <p className="text-sm text-center text-green-600 font-medium mb-4 bg-green-50 py-2 rounded">
                               Offers {data.freeConsultMinutes} min free consultation
                           </p>
                       )}

                       <BookingCalendar 
                          lawyerProfileId={data.id} 
                          hourlyRate={data.hourlyRate}
                          availability={[]} // Since this is dummy data, pass an empty array, or mock availability here if needed
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
                       <p className="text-muted-foreground leading-relaxed">{data.bio}</p>

                       <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 mt-8">
                            <div className="flex items-start gap-3">
                                <Briefcase className="w-5 h-5 text-primary mt-0.5" />
                                <div>
                                    <div className="font-medium">Experience</div>
                                    <div className="text-sm text-muted-foreground">{data.experienceYears} Years</div>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <Languages className="w-5 h-5 text-primary mt-0.5" />
                                <div>
                                    <div className="font-medium">Languages</div>
                                    <div className="text-sm text-muted-foreground">{data.languages.join(", ")}</div>
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
                                    <div className="text-sm text-muted-foreground">{data.barCouncilNumber}</div>
                                </div>
                            </div>
                       </div>
                   </CardContent>
               </Card>

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

               {/* Education Section */}
               <Card>
                   <CardHeader>
                       <CardTitle>Education</CardTitle>
                   </CardHeader>
                   <CardContent>
                        <div className="flex items-start gap-4 p-4 border rounded-lg bg-muted/20">
                            <GraduationCap className="w-8 h-8 text-primary" />
                            <div>
                                <div className="font-semibold text-lg">{data.degreeCollege}</div>
                                <div className="text-muted-foreground">Class of {data.degreeYear}</div>
                            </div>
                        </div>
                   </CardContent>
               </Card>
           </div>
       </div>
    </div>
  )
}

const DUMMY_LAWYERS = [
  ...Array(3) // keeping dummy data internal to component structure since api isn't active
]
