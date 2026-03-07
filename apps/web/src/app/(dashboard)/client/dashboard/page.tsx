"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, MoreHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function ClientDashboardPage() {
    return (
        <div className="space-y-8">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
                <p className="text-muted-foreground hidden md:block">Here&apos;s a quick overview of your LegalHub activity.</p>
            </div>
            
            {/* KPI Cards */}
            <div className="grid gap-6 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm border-b-0 font-medium text-muted-foreground">Active Cases</CardTitle>
                        <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-emerald-200">Verified</Badge>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-bold">2</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Upcoming Bookings</CardTitle>
                        <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-emerald-200">KPI</Badge>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-bold">3</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Spent</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-bold">₹8,500</div>
                    </CardContent>
                </Card>
            </div>
            
            {/* Split View for Timeline and Messages */}
            <div className="grid gap-6 md:grid-cols-3 items-start">
                
                {/* Case Timeline Area */}
                <Card className="md:col-span-2">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-xl">Case Timeline</CardTitle>
                        <div className="relative w-64 hidden sm:block">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Search timeline..." className="pl-8 bg-muted/30" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            <div className="grid grid-cols-[1fr_80px] gap-4 text-sm font-medium text-muted-foreground border-b pb-2">
                                <div>Lawyer</div>
                                <div className="text-right">Progress</div>
                            </div>
                            
                            {[
                              { name: "Dr. Eliza Reed", role: "Lawyer", progress: 80 },
                              { name: "James Dame", role: "Lawyer", progress: 45 },
                              { name: "Dalian Smith", role: "Lawyer", progress: 95 }
                            ].map((item, i) => (
                                <div key={i} className="flex items-center justify-between gap-4 py-2 border-b last:border-0 last:pb-0">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                            {item.name[0]}
                                        </div>
                                        <div>
                                            <div className="font-semibold">{item.name}</div>
                                            <div className="text-sm text-muted-foreground">{item.role}</div>
                                        </div>
                                    </div>
                                    <div className="w-1/3 flex items-center justify-end">
                                        <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                                            <div className="bg-primary h-full rounded-full" style={{ width: `${item.progress}%` }} />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Recent Messages */}
                <Card className="md:col-span-1">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-xl">Recent Messages</CardTitle>
                        <MoreHorizontal className="h-5 w-5 text-muted-foreground" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="p-4 bg-primary/5 rounded-xl border border-primary/10">
                            <div className="flex items-center justify-between mb-2">
                                <span className="font-semibold flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-primary" />
                                    Messages
                                </span>
                                <Badge variant="secondary" className="text-xs">New</Badge>
                            </div>
                            <p className="text-sm text-foreground/80">Your lawyer received a message and remains responsive to this matter.</p>
                        </div>
                        <div className="p-4 bg-muted/20 rounded-xl border border-transparent">
                            <div className="flex items-center justify-between mb-2">
                                <span className="font-semibold text-muted-foreground">Document Update</span>
                            </div>
                            <p className="text-sm text-muted-foreground">The draft agreement for your review has been uploaded.</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
