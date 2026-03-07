import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Scale, ShieldCheck, Clock, Users } from "lucide-react"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      
      {/* Premium Hero Section */}
      <section className="bg-background pt-32 pb-20 border-b">
        <div className="container mx-auto px-4 text-center max-w-4xl">
          <Badge className="mb-8 px-4 py-2 flex items-center gap-2 mx-auto w-fit text-sm bg-primary/10 text-primary hover:bg-primary/20 cursor-default border-primary/20">
            <Scale className="w-4 h-4" />
            LegalHub — The Premier Legal Network
          </Badge>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-8 text-foreground leading-tight">
            Expert Legal Counsel, <br className="hidden md:block"/> Right When You Need It.
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
            Connect with top-rated, verified advocates across India for seamless online consultations and case management.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/find-lawyer">
               <Button size="lg" className="w-full sm:w-auto h-14 px-8 text-lg shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">Find a Lawyer Now</Button>
            </Link>
            <Link href="/register/lawyer">
               <Button size="lg" variant="outline" className="w-full sm:w-auto h-14 px-8 text-lg border-primary/20 hover:bg-muted/50 transition-all">I am a Lawyer</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-muted/20">
        <div className="container mx-auto px-4">
           <div className="text-center mb-16 max-w-3xl mx-auto">
             <h2 className="text-3xl md:text-4xl font-bold mb-6 tracking-tight">Why Choose LegalHub?</h2>
             <p className="text-lg text-muted-foreground">Everything you need to resolve your legal issues with complete confidence and security.</p>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
              <Card className="border shadow-sm bg-card hover:shadow-md hover:border-primary/50 transition-all group">
                 <CardContent className="pt-8 text-center">
                    <div className="w-14 h-14 mx-auto bg-primary/10 text-primary rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                       <ShieldCheck className="w-7 h-7" />
                    </div>
                    <h3 className="text-xl font-bold mb-3">100% Verified</h3>
                    <p className="text-muted-foreground text-sm">Every lawyer undergoes strict bar council verification.</p>
                 </CardContent>
              </Card>

              <Card className="border shadow-sm bg-card hover:shadow-md hover:border-primary/50 transition-all group">
                 <CardContent className="pt-8 text-center">
                    <div className="w-14 h-14 mx-auto bg-primary/10 text-primary rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                       <Clock className="w-7 h-7" />
                    </div>
                    <h3 className="text-xl font-bold mb-3">Instant Booking</h3>
                    <p className="text-muted-foreground text-sm">Book video or in-person slots immediately, 24/7.</p>
                 </CardContent>
              </Card>

              <Card className="border shadow-sm bg-card hover:shadow-md hover:border-primary/50 transition-all group">
                 <CardContent className="pt-8 text-center">
                    <div className="w-14 h-14 mx-auto bg-primary/10 text-primary rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                       <Scale className="w-7 h-7" />
                    </div>
                    <h3 className="text-xl font-bold mb-3">All Specializations</h3>
                    <p className="text-muted-foreground text-sm">From corporate law to family disputes, find exact expertise.</p>
                 </CardContent>
              </Card>

              <Card className="border shadow-sm bg-card hover:shadow-md hover:border-primary/50 transition-all group">
                 <CardContent className="pt-8 text-center">
                    <div className="w-14 h-14 mx-auto bg-primary/10 text-primary rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                       <Users className="w-7 h-7" />
                    </div>
                    <h3 className="text-xl font-bold mb-3">Secure Chat</h3>
                    <p className="text-muted-foreground text-sm">End-to-end encrypted messaging and document sharing.</p>
                 </CardContent>
              </Card>
           </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-sidebar text-sidebar-foreground text-center px-4 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary via-background to-background"></div>
          <div className="max-w-3xl mx-auto relative z-10">
             <h2 className="text-4xl md:text-5xl font-extrabold mb-6 tracking-tight text-white">Ready to get started?</h2>
             <p className="text-xl md:text-2xl mb-10 text-white/80 leading-relaxed">Join thousands of clients getting transparent, reliable legal advice every day.</p>
             <Link href="/register">
                 <Button size="lg" className="h-14 px-10 text-lg font-semibold bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg hover:shadow-primary/25 hover:-translate-y-1 transition-all">
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
