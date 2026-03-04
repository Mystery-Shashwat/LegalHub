import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Star, MapPin, Briefcase, Languages } from "lucide-react"

interface LawyerProps {
  id: string
  name: string
  specializations: string[]
  experienceYears: number
  city: string
  state: string
  languages: string[]
  hourlyRate: number
  avgRating: number
  totalReviews: number
  freeConsultation: boolean
}

export default function LawyerCard({ data }: { data: LawyerProps }) {
  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row gap-6">
          <div className="flex-1 space-y-4">
            <div>
              <div className="flex justify-between items-start">
                  <h3 className="text-xl font-bold">{data.name}</h3>
                  <div className="flex items-center gap-1 bg-amber-50 text-amber-600 px-2 py-1 rounded text-sm font-medium">
                    <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                    {data.avgRating.toFixed(1)} ({data.totalReviews})
                  </div>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {data.specializations.map((spec) => (
                  <Badge variant="secondary" key={spec}>{spec}</Badge>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-muted-foreground mt-4">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" /> {data.city}, {data.state}
              </div>
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4" /> {data.experienceYears} Years Exp.
              </div>
              <div className="flex items-center gap-2">
                <Languages className="w-4 h-4" /> {data.languages.join(", ")}
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-between items-end min-w-[150px] border-t sm:border-t-0 sm:border-l pt-4 sm:pt-0 pl-0 sm:pl-6">
            <div className="text-right w-full">
              <div className="text-2xl font-bold">₹{data.hourlyRate}</div>
              <div className="text-xs text-muted-foreground">per consultation</div>
              {data.freeConsultation && (
                 <Badge className="mt-2 bg-green-100 text-green-800 hover:bg-green-100 border-none">1st Consult Free</Badge>
              )}
            </div>
            
            <Link href={`/lawyers/${data.id}`} className="w-full mt-4">
              <Button className="w-full">View Profile</Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
