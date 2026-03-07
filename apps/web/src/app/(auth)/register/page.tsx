import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { User, Scale } from "lucide-react"

export default function RegisterPicker() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-muted/20 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-96 bg-primary/5 -skew-y-6 transform origin-top-left -z-10" />
      
      <Card className="w-full max-w-2xl shadow-2xl border-border/50 relative overflow-hidden bg-card/95 backdrop-blur-sm">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary/50 to-primary"></div>
        <CardHeader className="text-center pt-10 pb-4">
          <CardTitle className="text-4xl font-extrabold tracking-tight text-foreground">Join LegalHub</CardTitle>
          <CardDescription className="text-lg mt-2 text-muted-foreground">Are you looking for trusted legal help, or offering it?</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-6 sm:flex-row justify-center mt-6 p-6">
          <Link href="/register/client" className="flex-1 group">
            <Button variant="outline" className="w-full h-48 flex flex-col items-center justify-center gap-4 text-xl border-2 border-border/60 hover:border-primary/50 hover:bg-primary/5 transition-all group-hover:shadow-md">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                 <User className="w-8 h-8" />
              </div>
              <div className="flex flex-col items-center gap-1">
                 <span className="font-bold text-foreground">I am a Client</span>
                 <span className="text-sm font-medium text-muted-foreground">Looking for a lawyer</span>
              </div>
            </Button>
          </Link>
          <Link href="/register/lawyer" className="flex-1 group">
            <Button variant="outline" className="w-full h-48 flex flex-col items-center justify-center gap-4 text-xl border-2 border-border/60 hover:border-primary/50 hover:bg-primary/5 transition-all group-hover:shadow-md">
               <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                 <Scale className="w-8 h-8" />
              </div>
              <div className="flex flex-col items-center gap-1">
                 <span className="font-bold text-foreground">I am a Lawyer</span>
                 <span className="text-sm font-medium text-muted-foreground">Offering legal services</span>
              </div>
            </Button>
          </Link>
        </CardContent>
        <div className="text-center mt-2 mb-8">
          <p className="text-base text-muted-foreground font-medium">
            Already have an account? <Link href="/login" className="text-primary hover:underline font-bold">Log in here</Link>
          </p>
        </div>
      </Card>
    </div>
  )
}
