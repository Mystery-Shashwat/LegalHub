"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
export default function LawyerDashboardPage() {
    return (
        <div className="space-y-8">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
                <p className="text-muted-foreground hidden md:block">Manage your case load, requests, and schedules.</p>
            </div>
            
            {/* KPI Cards */}
            <div className="grid gap-6 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm border-b-0 font-medium text-muted-foreground">Pending Requests</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-bold">5</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Cases in Progress</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-bold">8</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Earnings</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-bold">₹86,500</div>
                    </CardContent>
                </Card>
            </div>
            
            {/* Split View for Requests and Schedule */}
            <div className="grid gap-6 md:grid-cols-3 items-start">
                
                {/* Pending Booking Requests Area */}
                <Card className="md:col-span-2">
                    <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
                        <CardTitle className="text-xl">Pending Booking Requests</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="space-y-6">
                            <div className="grid grid-cols-[1fr_160px] gap-4 text-sm font-medium text-muted-foreground border-b pb-2 hidden sm:grid">
                                <div>Client</div>
                                <div className="text-right">Action</div>
                            </div>
                            
                            {[
                              { name: "John Doe", type: "Corporate Dispute", badge: "High Priority" },
                              { name: "Sarah Smith", type: "Real Estate", badge: "" },
                              { name: "Mike Johnson", type: "Family Law", badge: "" }
                            ].map((item, i) => (
                                <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-2 border-b last:border-0 last:pb-0">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold shrink-0">
                                            {item.name[0]}
                                        </div>
                                        <div>
                                            <div className="font-semibold flex items-center gap-2">
                                                {item.name}
                                                {item.badge && <Badge variant="destructive" className="text-[10px] h-4">{item.badge}</Badge>}
                                            </div>
                                            <div className="text-sm text-muted-foreground">{item.type}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 sm:justify-end">
                                        <Button size="sm" className="bg-primary hover:bg-primary/90">
                                            <Check className="w-4 h-4 mr-1 hidden sm:block"/> Accept
                                        </Button>
                                        <Button size="sm" variant="outline">
                                            <X className="w-4 h-4 mr-1 hidden sm:block"/> Decline
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Today's Schedule */}
                <Card className="md:col-span-1 border-primary/20 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/50 to-primary"></div>
                    <CardHeader className="pb-4">
                        <CardTitle className="text-xl">Today&apos;s Schedule</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {[
                            { title: "Initial Consultation", time: "10:30 AM", type: "Video" },
                            { title: "Document Review", time: "2:00 PM", type: "In-Person" },
                            { title: "Client Follow-up", time: "4:30 PM", type: "Phone" }
                        ].map((meeting, i) => (
                            <div key={i} className="p-3 bg-muted/30 rounded-lg border border-transparent hover:border-border transition-colors">
                                <div className="text-sm font-semibold mb-1">{meeting.title}</div>
                                <div className="flex items-center justify-between text-xs text-muted-foreground">
                                    <span>{meeting.time}</span>
                                    <Badge variant="secondary" className="font-normal">{meeting.type}</Badge>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
