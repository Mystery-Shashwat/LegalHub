import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Scale, ShieldCheck, Clock, Users } from "lucide-react"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-primary/10 to-background pt-24 pb-16">
        <div className="container mx-auto px-4 text-center max-w-4xl">
          <Badge className="mb-6 px-4 py-1 text-sm bg-primary/10 text-primary hover:bg-primary/20 cursor-default">
            India&apos;s #1 Legal Platform
          </Badge>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8">
            Expert Legal Help, <br className="hidden md:block"/> Right When You Need It.
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
            Connect with top-rated, verified advocates across India for seamless online consultations and case management.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/find-lawyer">
               <Button size="lg" className="w-full sm:w-auto text-lg h-14 px-8">Find a Lawyer Now</Button>
            </Link>
            <Link href="/register/lawyer">
               <Button size="lg" variant="outline" className="w-full sm:w-auto text-lg h-14 px-8 border-primary text-primary hover:bg-primary/5">I am a Lawyer</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
           <div className="text-center mb-16">
             <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose LegalHub?</h2>
             <p className="text-lg text-muted-foreground">Everything you need to resolve your legal issues with confidence.</p>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
              <Card className="border-none shadow-md bg-background/50 backdrop-blur-sm hover:shadow-lg transition-all">
                 <CardContent className="pt-8 text-center">
                    <div className="w-16 h-16 mx-auto bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-6">
                       <ShieldCheck className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold mb-3">100% Verified</h3>
                    <p className="text-muted-foreground">Every lawyer undergoes strict bar council verification.</p>
                 </CardContent>
              </Card>

              <Card className="border-none shadow-md bg-background/50 backdrop-blur-sm hover:shadow-lg transition-all">
                 <CardContent className="pt-8 text-center">
                    <div className="w-16 h-16 mx-auto bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
                       <Clock className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold mb-3">Instant Booking</h3>
                    <p className="text-muted-foreground">Book video or in-person slots immediately, 24/7.</p>
                 </CardContent>
              </Card>

              <Card className="border-none shadow-md bg-background/50 backdrop-blur-sm hover:shadow-lg transition-all">
                 <CardContent className="pt-8 text-center">
                    <div className="w-16 h-16 mx-auto bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mb-6">
                       <Scale className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold mb-3">All Specializations</h3>
                    <p className="text-muted-foreground">From corporate law to family disputes, find exact expertise.</p>
                 </CardContent>
              </Card>

              <Card className="border-none shadow-md bg-background/50 backdrop-blur-sm hover:shadow-lg transition-all">
                 <CardContent className="pt-8 text-center">
                    <div className="w-16 h-16 mx-auto bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mb-6">
                       <Users className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold mb-3">Secure Chat</h3>
                    <p className="text-muted-foreground">End-to-end encrypted messaging and document sharing.</p>
                 </CardContent>
              </Card>
           </div>
        </div>
      </section>

      <section className="py-24 bg-primary text-primary-foreground text-center px-4">
          <div className="max-w-3xl mx-auto">
             <h2 className="text-4xl font-bold mb-6">Ready to get started?</h2>
             <p className="text-xl mb-10 opacity-90">Join thousands of clients getting transparent, reliable legal advice everyday.</p>
             <Link href="/register">
                 <Button size="lg" variant="secondary" className="h-14 px-10 text-lg font-semibold">
                    Create Free Account
                 </Button>
             </Link>
          </div>
      </section>

    </div>
  )
}

function Badge({ children, className }: { children: React.ReactNode, className?: string }) {
    return <span className={`inline-flex items-center rounded-full font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${className}`}>{children}</span>
}
