"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Search, CalendarCheck, MessageSquare, ShieldCheck, Scale, FileText } from "lucide-react"

export default function HowItWorksPage() {
    return (
        <div className="container mx-auto py-16 px-4 max-w-5xl">
            <div className="text-center mb-16">
                <h1 className="text-4xl font-bold tracking-tight mb-4">How LegalHub Works</h1>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                    A transparent, secure, and seamless platform connecting individuals with verified legal professionals.
                </p>
            </div>

            <div className="space-y-24">
                {/* For Clients */}
                <section>
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                            <Scale className="w-6 h-6 text-primary" />
                        </div>
                        <h2 className="text-3xl font-bold">For Clients</h2>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <Card className="border-none shadow-none bg-muted/40">
                            <CardContent className="pt-6">
                                <div className="w-12 h-12 bg-primary text-primary-foreground rounded-lg flex items-center justify-center text-xl font-bold mb-4">1</div>
                                <h3 className="text-xl font-semibold mb-2 flex items-center gap-2">
                                    <Search className="w-5 h-5 text-muted-foreground" /> Find a Lawyer
                                </h3>
                                <p className="text-muted-foreground leading-relaxed">
                                    Search for verified advocates by specialization, location, and language. Read genuine reviews from previous clients before making a decision.
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="border-none shadow-none bg-muted/40">
                            <CardContent className="pt-6">
                                <div className="w-12 h-12 bg-primary text-primary-foreground rounded-lg flex items-center justify-center text-xl font-bold mb-4">2</div>
                                <h3 className="text-xl font-semibold mb-2 flex items-center gap-2">
                                    <CalendarCheck className="w-5 h-5 text-muted-foreground" /> Book Consultation
                                </h3>
                                <p className="text-muted-foreground leading-relaxed">
                                    View real-time availability calendars and securely book a video or in-person consultation slot that fits your schedule.
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="border-none shadow-none bg-muted/40">
                            <CardContent className="pt-6">
                                <div className="w-12 h-12 bg-primary text-primary-foreground rounded-lg flex items-center justify-center text-xl font-bold mb-4">3</div>
                                <h3 className="text-xl font-semibold mb-2 flex items-center gap-2">
                                    <MessageSquare className="w-5 h-5 text-muted-foreground" /> Resolve Your Case
                                </h3>
                                <p className="text-muted-foreground leading-relaxed">
                                    Use our encrypted chat platform to share documents securely, communicate in real-time, and track your case progress all in one place.
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </section>

                <div className="w-full h-px bg-border" />

                {/* For Lawyers */}
                <section>
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                            <ShieldCheck className="w-6 h-6 text-primary" />
                        </div>
                        <h2 className="text-3xl font-bold">For Lawyers</h2>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <Card className="border-none shadow-none bg-muted/40">
                            <CardContent className="pt-6">
                                <div className="w-12 h-12 bg-primary text-primary-foreground rounded-lg flex items-center justify-center text-xl font-bold mb-4">1</div>
                                <h3 className="text-xl font-semibold mb-2 flex items-center gap-2">
                                    <ShieldCheck className="w-5 h-5 text-muted-foreground" /> Get Verified
                                </h3>
                                <p className="text-muted-foreground leading-relaxed">
                                    Upload your Bar Council credentials for platform verification. Once approved, your profile becomes visible to thousands of potential clients.
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="border-none shadow-none bg-muted/40">
                            <CardContent className="pt-6">
                                <div className="w-12 h-12 bg-primary text-primary-foreground rounded-lg flex items-center justify-center text-xl font-bold mb-4">2</div>
                                <h3 className="text-xl font-semibold mb-2 flex items-center gap-2">
                                    <CalendarCheck className="w-5 h-5 text-muted-foreground" /> Manage Practice
                                </h3>
                                <p className="text-muted-foreground leading-relaxed">
                                    Define your available hours, set your consultation fees, and let the automated system handle booking requests and calendar conflicts.
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="border-none shadow-none bg-muted/40">
                            <CardContent className="pt-6">
                                <div className="w-12 h-12 bg-primary text-primary-foreground rounded-lg flex items-center justify-center text-xl font-bold mb-4">3</div>
                                <h3 className="text-xl font-semibold mb-2 flex items-center gap-2">
                                    <FileText className="w-5 h-5 text-muted-foreground" /> Track Earnings
                                </h3>
                                <p className="text-muted-foreground leading-relaxed">
                                    Receive upfront payments for every consultation. View a detailed ledger of your earnings and track all open case documents efficiently.
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </section>
            </div>
        </div>
    )
}
